import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Firebase Admin
const admin = initializeApp();
const db = getFirestore();
const auth = getAuth();

// Health check
export const health = onRequest(async (req, res) => {
  res.json({ ok: true, service: 'dineconnect-functions' });
});

// User registration
export const register = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    // Store user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      username,
      role: role || 'customer',
      createdAt: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email, role: role || 'customer' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        uid: userRecord.uid,
        email,
        username,
        role: role || 'customer',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User login
export const login = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Verify Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Generate JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email, role: userData.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        uid: userRecord.uid,
        email,
        username: userData.username,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get user profile
export const getUser = onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userDoc.data() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
export const updateUser = onRequest(async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const { username, preferences } = req.body;

    await db.collection('users').doc(decoded.uid).update({
      ...(username && { username }),
      ...(preferences && { preferences }),
      updatedAt: new Date(),
    });

    const updatedDoc = await db.collection('users').doc(decoded.uid).get();
    res.json({ user: updatedDoc.data() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});
