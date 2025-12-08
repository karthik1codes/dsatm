const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure CORS to allow requests from localhost:8000
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:9000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET'
});

// Log Razorpay initialization status
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    console.log('✅ Razorpay initialized with Key ID:', process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...');
} else {
    console.warn('⚠️ Warning: Razorpay keys not found in environment variables!');
}

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'subscriptions.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Create tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            user_name TEXT,
            plan_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'INR',
            razorpay_order_id TEXT,
            razorpay_payment_id TEXT,
            razorpay_signature TEXT,
            start_date TEXT,
            end_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating subscriptions table:', err.message);
            } else {
                console.log('Subscriptions table ready');
            }
        });

        // User stats table
        db.run(`CREATE TABLE IF NOT EXISTS user_stats (
            user_email TEXT PRIMARY KEY,
            user_name TEXT,
            total_points INTEGER DEFAULT 0,
            lessons_complete INTEGER DEFAULT 0,
            achievements INTEGER DEFAULT 0,
            time_spent INTEGER DEFAULT 0,
            streak INTEGER DEFAULT 0,
            last_activity TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating user_stats table:', err.message);
            } else {
                console.log('User stats table ready');
            }
        });
    }
});

// Plan configurations (amounts in paise)
const PLANS = {
    monthly: {
        name: 'Monthly Plan',
        amount: 9900, // ₹99
        duration: 'monthly',
        days: 30
    },
    yearly: {
        name: 'Yearly Plan',
        amount: 118800, // ₹1,188 (₹99 × 12)
        duration: 'yearly',
        days: 365
    },
    team_monthly: {
        name: 'Team Monthly Plan',
        amount: 150000, // ₹1,500
        duration: 'monthly',
        days: 30
    },
    team_yearly: {
        name: 'Team Yearly Plan',
        amount: 1800000, // ₹18,000 (₹1,500 × 12)
        duration: 'yearly',
        days: 365
    }
};

// Allow legacy/alias plan keys to map to the current plan keys
const PLAN_ALIASES = {
    individualMonthly: 'monthly',
    individualYearly: 'yearly',
    teamMonthly: 'team_monthly',
    teamYearly: 'team_yearly'
};

// Helper function to calculate end date
function calculateEndDate(startDate, planType) {
    const start = new Date(startDate);
    const plan = PLANS[planType];
    if (!plan) return null;
    
    start.setDate(start.getDate() + plan.days);
    return start.toISOString();
}

// Helper function to generate receipt ID (max 40 characters for Razorpay)
function generateReceiptId(userEmail, planType) {
    if (!userEmail || !planType) {
        // Fallback if userEmail or planType is missing
        const fallback = `RCP_${Date.now().toString(36).slice(-12)}`;
        return fallback.length > 40 ? fallback.substring(0, 40) : fallback;
    }
    
    // Create a short hash from email (8 chars for more safety)
    const emailHash = crypto.createHash('md5').update(userEmail).digest('hex').substring(0, 8);
    const planCode = planType.substring(0, 3).toUpperCase(); // First 3 chars of plan type (MON or YEA)
    
    // Create a short timestamp (last 10 chars of base36 timestamp for uniqueness)
    const timestamp = Date.now().toString(36).slice(-10);
    
    // Format: RCP_<plan>_<hash><timestamp>
    // RCP_ (4) + MON (3) + _ (1) + hash (8) + timestamp (10) = 26 chars
    // This is well under 40 chars limit
    const receipt = `RCP_${planCode}_${emailHash}${timestamp}`;
    
    // Ensure it's exactly 40 characters or less (safety check)
    const finalReceipt = receipt.length > 40 ? receipt.substring(0, 40) : receipt;
    
    // Log for debugging
    console.log(`Generated receipt: ${finalReceipt} (length: ${finalReceipt.length})`);
    
    return finalReceipt;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BrightWords Subscription API is running' });
});

// Helpers for stats
function getOrCreateStats(email, name, cb) {
    const safeEmail = (email || '').toLowerCase();
    if (!safeEmail) return cb(new Error('Email is required'));
    db.get('SELECT * FROM user_stats WHERE user_email = ?', [safeEmail], (err, row) => {
        if (err) return cb(err);
        if (row) return cb(null, row);
        const now = new Date().toISOString().slice(0, 10);
        db.run(
            `INSERT INTO user_stats (user_email, user_name, streak, last_activity) VALUES (?, ?, ?, ?)`,
            [safeEmail, name || '', 1, now],
            function (insertErr) {
                if (insertErr) return cb(insertErr);
                db.get('SELECT * FROM user_stats WHERE user_email = ?', [safeEmail], cb);
            }
        );
    });
}

function computeStreak(row) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (!row.last_activity) {
        return { streak: 1, last_activity: todayStr };
    }
    const last = new Date(row.last_activity);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        return { streak: row.streak, last_activity: todayStr };
    }
    if (diffDays === 1) {
        return { streak: row.streak + 1, last_activity: todayStr };
    }
    // missed a day
    return { streak: 1, last_activity: todayStr };
}

// Get stats
app.get('/api/stats/:email', (req, res) => {
    const email = (req.params.email || '').toLowerCase();
    const name = req.query.name || '';
    getOrCreateStats(email, name, (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }
        const computed = computeStreak(row);
        db.run(
            `UPDATE user_stats SET streak = ?, last_activity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?`,
            [computed.streak, computed.last_activity, email],
            (uErr) => {
                if (uErr) {
                    return res.status(500).json({ error: 'Failed to update streak' });
                }
                return res.json({
                    user_email: email,
                    user_name: row.user_name,
                    total_points: row.total_points,
                    lessons_complete: row.lessons_complete,
                    achievements: row.achievements,
                    time_spent: row.time_spent,
                    streak: computed.streak,
                    last_activity: computed.last_activity
                });
            }
        );
    });
});

// Update stats (incremental)
app.post('/api/stats/update', (req, res) => {
    const { userEmail, userName, totalPoints = 0, lessonsComplete = 0, achievements = 0, timeSpent = 0 } = req.body || {};
    const email = (userEmail || '').toLowerCase();
    if (!email) {
        return res.status(400).json({ error: 'userEmail is required' });
    }
    getOrCreateStats(email, userName, (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }
        const computed = computeStreak(row);
        const newTotals = {
            total_points: row.total_points + Number(totalPoints || 0),
            lessons_complete: row.lessons_complete + Number(lessonsComplete || 0),
            achievements: row.achievements + Number(achievements || 0),
            time_spent: row.time_spent + Number(timeSpent || 0),
            streak: computed.streak,
            last_activity: computed.last_activity
        };
        db.run(
            `UPDATE user_stats
             SET total_points = ?, lessons_complete = ?, achievements = ?, time_spent = ?, streak = ?, last_activity = ?, user_name = ?, updated_at = CURRENT_TIMESTAMP
             WHERE user_email = ?`,
            [
                newTotals.total_points,
                newTotals.lessons_complete,
                newTotals.achievements,
                newTotals.time_spent,
                newTotals.streak,
                newTotals.last_activity,
                userName || row.user_name || '',
                email
            ],
            (uErr) => {
                if (uErr) {
                    return res.status(500).json({ error: 'Failed to update stats' });
                }
                return res.json({
                    user_email: email,
                    ...newTotals
                });
            }
        );
    });
});

// Create Razorpay order
app.post('/api/subscription/create-order', async (req, res) => {
    try {
    let { plan, amount, currency, userEmail, userName } = req.body;
    // Normalize plan using aliases if needed
    if (!PLANS[plan] && PLAN_ALIASES[plan]) {
        plan = PLAN_ALIASES[plan];
    }

        // Validate plan
        if (!PLANS[plan]) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        // Validate amount matches plan
        if (amount !== PLANS[plan].amount) {
            return res.status(400).json({ error: 'Amount does not match plan' });
        }

        // Create Razorpay order
        // Generate receipt ID (must be max 40 characters)
        const receiptId = generateReceiptId(userEmail, plan);
        
        // Validate receipt length before creating order
        if (receiptId.length > 40) {
            console.error('❌ Receipt ID too long:', receiptId, 'Length:', receiptId.length);
            return res.status(500).json({ 
                error: 'Internal error: Receipt ID generation failed',
                details: `Receipt length ${receiptId.length} exceeds 40 characters`
            });
        }
        
        const options = {
            amount: amount,
            currency: currency || 'INR',
            receipt: receiptId,
            notes: {
                plan: plan,
                user_email: userEmail,
                user_name: userName
            }
        };

        console.log('Creating Razorpay order with options:', {
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            receiptLength: options.receipt.length
        });

        const order = await razorpay.orders.create(options);
        console.log('✅ Razorpay order created successfully:', order.id);

        // Store order in database (status: pending)
        const startDate = new Date().toISOString();
        const endDate = calculateEndDate(startDate, plan);

        db.run(
            `INSERT INTO subscriptions (user_email, user_name, plan_type, status, amount, currency, razorpay_order_id, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userEmail, userName || '', plan, 'pending', amount, currency || 'INR', order.id, startDate, endDate],
            function(err) {
                if (err) {
                    console.error('Error storing order:', err.message);
                }
            }
        );

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status
        });

    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        
        // Extract detailed error information
        let errorMessage = 'Failed to create order';
        let errorDetails = error.message;
        let errorCode = 500;
        
        if (error.error) {
            // Razorpay API error
            errorMessage = error.error.description || error.error.reason || error.error.message || errorMessage;
            errorDetails = JSON.stringify(error.error);
            errorCode = error.statusCode || 500;
            console.error('Razorpay API Error:', error.error);
        } else if (error.message) {
            errorMessage = error.message;
            console.error('Error message:', error.message);
        }
        
        // Check if it's an authentication error
        if (errorMessage.includes('authentication') || errorMessage.includes('key') || errorMessage.includes('unauthorized')) {
            errorMessage = 'Razorpay authentication failed. Please check your API keys in the .env file.';
        }
        
        res.status(errorCode).json({ 
            error: errorMessage,
            details: errorDetails,
            code: errorCode
        });
    }
});

// Verify payment and activate subscription
app.post('/api/subscription/verify-payment', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, userEmail } = req.body;

        // Verify the payment signature
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!razorpaySecret) {
            return res.status(500).json({ error: 'Razorpay secret key not configured' });
        }
        
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac('sha256', razorpaySecret)
            .update(text)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update subscription in database
        const startDate = new Date().toISOString();
        const endDate = calculateEndDate(startDate, plan);

        db.run(
            `UPDATE subscriptions 
             SET status = 'active', 
                 razorpay_payment_id = ?, 
                 razorpay_signature = ?,
                 start_date = ?,
                 end_date = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE razorpay_order_id = ? AND user_email = ?`,
            [razorpay_payment_id, razorpay_signature, startDate, endDate, razorpay_order_id, userEmail],
            function(err) {
                if (err) {
                    console.error('Error updating subscription:', err.message);
                    return res.status(500).json({ error: 'Failed to activate subscription' });
                }

                // Get the updated subscription
                db.get(
                    `SELECT * FROM subscriptions WHERE razorpay_order_id = ? AND user_email = ?`,
                    [razorpay_order_id, userEmail],
                    (err, row) => {
                        if (err) {
                            console.error('Error fetching subscription:', err.message);
                            return res.status(500).json({ error: 'Failed to fetch subscription' });
                        }

                        res.json({
                            success: true,
                            message: 'Payment verified and subscription activated',
                            subscription: {
                                plan: row.plan_type,
                                status: row.status,
                                startDate: row.start_date,
                                endDate: row.end_date,
                                paymentId: row.razorpay_payment_id
                            }
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment', details: error.message });
    }
});

// Check subscription status
app.get('/api/subscription/status', (req, res) => {
    try {
        const { userEmail } = req.query;

        if (!userEmail) {
            return res.status(400).json({ error: 'User email is required' });
        }

        // Get the most recent active subscription
        db.get(
            `SELECT * FROM subscriptions 
             WHERE user_email = ? AND status = 'active' 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userEmail],
            (err, row) => {
                if (err) {
                    console.error('Error fetching subscription:', err.message);
                    return res.status(500).json({ error: 'Failed to check subscription' });
                }

                if (!row) {
                    return res.json({
                        hasSubscription: false,
                        subscription: null
                    });
                }

                // Check if subscription is still valid
                const endDate = new Date(row.end_date);
                const now = new Date();

                if (endDate <= now) {
                    // Subscription expired - update status
                    db.run(
                        `UPDATE subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                        [row.id]
                    );

                    return res.json({
                        hasSubscription: false,
                        subscription: null
                    });
                }

                res.json({
                    hasSubscription: true,
                    subscription: {
                        plan: row.plan_type,
                        status: row.status,
                        startDate: row.start_date,
                        endDate: row.end_date
                    }
                });
            }
        );

    } catch (error) {
        console.error('Error checking subscription:', error);
        res.status(500).json({ error: 'Failed to check subscription status' });
    }
});

// Get user's subscription history
app.get('/api/subscription/history', (req, res) => {
    try {
        const { userEmail } = req.query;

        if (!userEmail) {
            return res.status(400).json({ error: 'User email is required' });
        }

        db.all(
            `SELECT * FROM subscriptions 
             WHERE user_email = ? 
             ORDER BY created_at DESC`,
            [userEmail],
            (err, rows) => {
                if (err) {
                    console.error('Error fetching subscription history:', err.message);
                    return res.status(500).json({ error: 'Failed to fetch subscription history' });
                }

                res.json({
                    subscriptions: rows.map(row => ({
                        id: row.id,
                        plan: row.plan_type,
                        status: row.status,
                        amount: row.amount,
                        currency: row.currency,
                        startDate: row.start_date,
                        endDate: row.end_date,
                        paymentId: row.razorpay_payment_id,
                        createdAt: row.created_at
                    }))
                });
            }
        );

    } catch (error) {
        console.error('Error fetching subscription history:', error);
        res.status(500).json({ error: 'Failed to fetch subscription history' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`BrightWords Subscription API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

