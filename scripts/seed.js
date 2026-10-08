require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../models/Team');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindtech_arena';

const seedTeams = [
  { teamName: 'Quantum Coders', teamLeader: 'Aarav Sharma', teamId: 'MTA-101', points: 980 },
  { teamName: 'Neural Knights', teamLeader: 'Diya Patel', teamId: 'MTA-102', points: 955 },
  { teamName: 'Byte Breakers', teamLeader: 'Rohan Iyer', teamId: 'MTA-103', points: 940 },
  { teamName: 'Syntax Sorcerers', teamLeader: 'Ananya Verma', teamId: 'MTA-104', points: 915 },
  { teamName: 'Algorithm Aces', teamLeader: 'Kabir Mehta', teamId: 'MTA-105', points: 890 },
  { teamName: 'Cyber Pioneers', teamLeader: 'Sneha Nair', teamId: 'MTA-106', points: 875 },
  { teamName: 'Logic Lords', teamLeader: 'Aditya Rao', teamId: 'MTA-107', points: 860 },
  { teamName: 'Binary Nomads', teamLeader: 'Ishita Gupta', teamId: 'MTA-108', points: 845 },
  { teamName: 'Matrix Mindsets', teamLeader: 'Arjun Sen', teamId: 'MTA-109', points: 830 },
  { teamName: 'Code Alchemists', teamLeader: 'Pooja Reddy', teamId: 'MTA-110', points: 815 },
  { teamName: 'Hack Hawks', teamLeader: 'Varun Joshi', teamId: 'MTA-111', points: 790 },
  { teamName: 'Pixel Pioneers', teamLeader: 'Rhea Menon', teamId: 'MTA-112', points: 775 },
  { teamName: 'Dev Dynasty', teamLeader: 'Karan Malhotra', teamId: 'MTA-113', points: 760 },
  { teamName: 'Infinity Loops', teamLeader: 'Tanvi Saxena', teamId: 'MTA-114', points: 745 },
  { teamName: 'Data Mavericks', teamLeader: 'Siddharth Pillai', teamId: 'MTA-115', points: 730 },
  { teamName: 'Glitch Hunters', teamLeader: 'Meera Kulkarni', teamId: 'MTA-116', points: 715 },
  { teamName: 'Bit Wizards', teamLeader: 'Nikhil Roy', teamId: 'MTA-117', points: 700 },
  { teamName: 'Stack Overlords', teamLeader: 'Priya Nambiar', teamId: 'MTA-118', points: 685 },
  { teamName: 'Vector Voyagers', teamLeader: 'Rahul Bhatia', teamId: 'MTA-119', points: 670 },
  { teamName: 'Cyber Sentinels', teamLeader: 'Kavya Deshmukh', teamId: 'MTA-120', points: 655 },
  { teamName: 'Logic Loopers', teamLeader: 'Devansh Pandey', teamId: 'MTA-121', points: 640 },
  { teamName: 'Robo Realm', teamLeader: 'Simran Chadha', teamId: 'MTA-122', points: 625 },
  { teamName: 'Tensor Titans', teamLeader: 'Gaurav Das', teamId: 'MTA-123', points: 610 },
  { teamName: 'Bug Busters', teamLeader: 'Avani Singhania', teamId: 'MTA-124', points: 595 },
  { teamName: 'Apex Algorithms', teamLeader: 'Pranav Nair', teamId: 'MTA-125', points: 580 },
  { teamName: 'Kernel Krakens', teamLeader: 'Swati Bose', teamId: 'MTA-126', points: 565 },
  { teamName: 'Syntax Shifters', teamLeader: 'Rishabh Sethi', teamId: 'MTA-127', points: 550 },
  { teamName: 'Code Crafters', teamLeader: 'Tara Mohan', teamId: 'MTA-128', points: 535 },
  { teamName: 'Cloud Chasers', teamLeader: 'Harsh Agarwal', teamId: 'MTA-129', points: 520 },
  { teamName: 'Nexus Navigators', teamLeader: 'Anika Soni', teamId: 'MTA-130', points: 505 },
  { teamName: 'Binary Blitz', teamLeader: 'Manish Kaul', teamId: 'MTA-131', points: 490 },
  { teamName: 'Hyper Hackers', teamLeader: 'Bhavna Chauhan', teamId: 'MTA-132', points: 475 },
  { teamName: 'Boolean Bosses', teamLeader: 'Vikram Thakur', teamId: 'MTA-133', points: 460 },
  { teamName: 'Script Strikers', teamLeader: 'Shruti Varma', teamId: 'MTA-134', points: 445 },
  { teamName: 'Deep Divers', teamLeader: 'Kunal Kapoor', teamId: 'MTA-135', points: 430 },
  { teamName: 'Data Dragons', teamLeader: 'Nandini Das', teamId: 'MTA-136', points: 415 },
  { teamName: 'Cyber Sprinters', teamLeader: 'Yashwardhan Pal', teamId: 'MTA-137', points: 400 },
  { teamName: 'Algo Archers', teamLeader: 'Tanya Goel', teamId: 'MTA-138', points: 385 },
  { teamName: 'Zero Day Squad', teamLeader: 'Abhinav Ghosh', teamId: 'MTA-139', points: 370 },
  { teamName: 'Pixel Pushers', teamLeader: 'Shreya Hegde', teamId: 'MTA-140', points: 355 },
  { teamName: 'Firewall Force', teamLeader: 'Ayush Trivedi', teamId: 'MTA-141', points: 340 },
  { teamName: 'Cache Crusaders', teamLeader: 'Divya Shenoy', teamId: 'MTA-142', points: 325 },
  { teamName: 'Byte Brawlers', teamLeader: 'Samarth Jain', teamId: 'MTA-143', points: 310 },
  { teamName: 'Echo Engineers', teamLeader: 'Radhika Nair', teamId: 'MTA-144', points: 295 },
  { teamName: 'Terminal Tacticians', teamLeader: 'Mohit Rawat', teamId: 'MTA-145', points: 280 },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing teams...');
    await Team.deleteMany({});

    console.log(`Inserting ${seedTeams.length} seed teams...`);
    const inserted = await Team.insertMany(seedTeams);

    console.log(`✅ Successfully seeded ${inserted.length} teams into MongoDB.`);
    console.log('Top 3 Teams in Seed Data:');
    inserted.slice(0, 3).forEach((team, i) => {
      console.log(`  #${i + 1} ${team.teamName} (${team.teamId}) - Leader: ${team.teamLeader} - Points: ${team.points}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
