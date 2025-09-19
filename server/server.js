const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- User Schema ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Donor', 'Charity', 'Worker', 'Admin'] },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
  contactPerson: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: function() { return this.role === 'Donor' || this.role === 'Charity'; }},
  businessName: { type: String },
  businessLicense: { type: String },
  foodSafetyCert: { type: String },
  charityName: { type: String },
  ngoLicense: { type: String },
  beneficiaryType: { type: String },
  storageFacilities: { type: String },
  employeeId: { type: String },
  areaOfOperation: { type: String },
});
const User = mongoose.model('User', userSchema);

// --- Donation Schema ---
const donationSchema = new mongoose.Schema({
  foodDescription: { type: String, required: true },
  quantity: { type: Number, required: true },
  serves: { type: Number, required: true },
  status: { type: String, default: 'Available', enum: ['Available', 'Claimed', 'In Transit', 'Delivered'] },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  donorAddress: { type: String, required: true },
  donorContact: { type: String, required: true },
  claimedByCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  charityName: { type: String },
  charityAddress: { type: String },
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerName: { type: String },
  workerContact: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Donation = mongoose.model('Donation', donationSchema);

// --- Auth Middleware ---
const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No auth token, authorization denied.' });
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(401).json({ msg: 'Token verification failed, authorization denied.' });
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- API Routes ---

// -- User Routes --
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ msg: 'Please enter all fields correctly (password min 6 chars).' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User with this email already exists.' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if this is the first user. If so, make them an Admin.
    const userCount = await User.countDocuments();
    let userRole = req.body.role;
    let userStatus = 'Pending';
    if (userCount === 0) {
        userRole = 'Admin';
        userStatus = 'Approved';
    }

    const newUser = new User({ ...req.body, role: userRole, status: userStatus, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ msg: err.message });
    res.status(500).json({ msg: 'Server error.' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });
    if (user.status !== 'Approved') return res.status(403).json({ msg: 'Your account is pending approval.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: { id: user._id, name: user.contactPerson, email: user.email, role: user.role, status: user.status },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Admin Routes --
app.get('/api/admin/pending-users', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user);
        if (admin.role !== 'Admin') return res.status(403).json({msg: "Access denied."});

        const pendingUsers = await User.find({ status: 'Pending' });
        res.json(pendingUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/admin/users/:id/status', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user);
        if (admin.role !== 'Admin') return res.status(403).json({msg: "Access denied."});

        const { status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({msg: "User not found."});

        user.status = status;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// -- Donation Routes --
app.get('/api/donations/available', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'Available' }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching available donations' });
  }
});

app.get('/api/donations/donor', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching donor donations' });
    }
});

app.get('/api/donations/charity', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ claimedByCharity: req.user }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching charity donations' });
    }
});

app.get('/api/donations/claimed', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ status: { $in: ['Claimed', 'In Transit'] } }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching claimed donations' });
    }
});

app.post('/api/donations', auth, async (req, res) => {
  try {
    const { foodDescription, quantity, serves } = req.body;
    const donor = await User.findById(req.user);
    if (!donor || donor.status !== 'Approved') return res.status(403).json({ msg: "User not approved to donate." });

    const newDonation = new Donation({ 
        foodDescription, 
        quantity, 
        serves,
        donorId: donor._id,
        donorName: donor.businessName || donor.contactPerson,
        donorAddress: donor.address,
        donorContact: donor.contactNumber
    });
    const savedDonation = await newDonation.save();
    res.status(201).json(savedDonation);
  } catch (error) {
    res.status(400).json({ error: 'Error creating donation' });
  }
});

app.put('/api/donations/:id', auth, async (req, res) => {
    try {
        const { foodDescription, quantity, serves } = req.body;
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ msg: "Donation not found." });
        if (donation.donorId.toString() !== req.user) return res.status(401).json({ msg: "User not authorized." });
        if (donation.status !== 'Available') return res.status(400).json({ msg: "Cannot edit a claimed donation." });

        donation.foodDescription = foodDescription;
        donation.quantity = quantity;
        donation.serves = serves;
        const updatedDonation = await donation.save();
        res.json(updatedDonation);
    } catch (error) {
        res.status(400).json({ error: 'Error updating donation' });
    }
});

app.delete('/api/donations/:id', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ msg: "Donation not found." });
        if (donation.donorId.toString() !== req.user) return res.status(401).json({ msg: "User not authorized." });
        if (donation.status !== 'Available') return res.status(400).json({ msg: "Cannot delete a claimed donation." });
        
        await Donation.findByIdAndDelete(req.params.id);
        res.json({ msg: "Donation deleted." });
    } catch (error) {
        res.status(400).json({ error: 'Error deleting donation' });
    }
});

app.patch('/api/donations/:id/claim', auth, async (req, res) => {
    try {
        const charity = await User.findById(req.user);
        if (charity.status !== 'Approved') return res.status(403).json({ msg: "User not approved to claim." });
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ msg: "Donation not found." });
        if (donation.status !== 'Available') return res.status(400).json({ msg: "Donation not available." });

        donation.status = 'Claimed';
        donation.claimedByCharity = charity._id;
        donation.charityName = charity.charityName || charity.contactPerson;
        donation.charityAddress = charity.address;
        const updatedDonation = await donation.save();
        res.json(updatedDonation);
    } catch (error) {
        res.status(400).json({ error: 'Error claiming donation' });
    }
});

app.patch('/api/donations/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const worker = await User.findById(req.user);
        const donation = await Donation.findById(req.params.id);

        if (!donation) return res.status(404).json({ msg: "Donation not found." });

        if (!donation.assignedWorker) {
            donation.assignedWorker = worker._id;
            donation.workerName = worker.contactPerson;
            donation.workerContact = worker.contactNumber;
        }

        donation.status = status;
        const updatedDonation = await donation.save();
        res.json(updatedDonation);
    } catch (error) {
        res.status(400).json({ error: 'Error updating status' });
    }
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});