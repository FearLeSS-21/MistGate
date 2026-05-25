"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('[Seed] Starting database seeding...');
    // Clean the database
    await prisma.activityLog.deleteMany({});
    await prisma.serviceRating.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.statusHistory.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('[Seed] Cleaned database tables.');
    // Hash passwords
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin@2026!', 10);
    const citizen1PasswordHash = await bcryptjs_1.default.hash('Citizen@2026!', 10);
    const citizen2PasswordHash = await bcryptjs_1.default.hash('Citizen@2026!', 10);
    // 1. Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@misrgate.gov.eg',
            password: adminPasswordHash,
            name: 'General Khaled Mahmoud',
            nationalId: '10000000000001',
            phone: '01001234567',
            role: 'ADMIN',
        },
    });
    console.log('[Seed] Created Admin User: admin@misrgate.gov.eg (password: Admin@2026!)');
    // 2. Create Citizen 1 (Zeyad)
    const citizen1 = await prisma.user.create({
        data: {
            email: 'zeyad@gmail.com',
            password: citizen1PasswordHash,
            name: 'Zeyad Ahmed Ali',
            nationalId: '30305240102456',
            phone: '01123456789',
            role: 'CITIZEN',
        },
    });
    // 3. Create Citizen 2 (Nour)
    const citizen2 = await prisma.user.create({
        data: {
            email: 'nour.hassan@gmail.com',
            password: citizen2PasswordHash,
            name: 'Nour Hassan Fahmy',
            nationalId: '30408120205897',
            phone: '01234567890',
            role: 'CITIZEN',
        },
    });
    console.log('[Seed] Created Citizen Users: zeyad@gmail.com, nour.hassan@gmail.com (password: Citizen@2026!)');
    // 4. Create Applications for Citizen 1 (Zeyad)
    const nationalIdData = {
        fullNameAr: 'زياد أحمد علي محمد',
        birthDate: '2003-05-24',
        maritalStatus: 'single',
        profession: 'Software Engineering Student',
        address: '12 Al-Ahram Street, Giza, Egypt',
        motherName: 'Fatma Moustafa Abdelrahman',
        reason: 'renewal',
    };
    const app1 = await prisma.application.create({
        data: {
            trackingCode: 'MG-1024-5896',
            serviceType: 'NATIONAL_ID',
            status: 'UNDER_REVIEW',
            data: JSON.stringify(nationalIdData),
            attachmentUrl: 'https://placeholder.com/id_scan.png',
            notes: 'Please double-check the profession document.',
            userId: citizen1.id,
        },
    });
    await prisma.statusHistory.createMany({
        data: [
            {
                applicationId: app1.id,
                status: 'PENDING',
                notes: 'Application submitted successfully.',
                changedBy: 'System',
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
            },
            {
                applicationId: app1.id,
                status: 'UNDER_REVIEW',
                notes: 'Document review in progress. Reviewing uploaded old ID card scan.',
                changedBy: admin.name,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            },
        ],
    });
    const militaryExemptionData = {
        fullNameAr: 'زياد أحمد علي محمد',
        reason: 'sole_breadwinner',
        familyStatus: 'Father is over 60 years old and incapable of working. Only brother is under 18 years old.',
    };
    const app2 = await prisma.application.create({
        data: {
            trackingCode: 'MG-3054-9981',
            serviceType: 'MILITARY_EXEMPTION',
            status: 'APPROVED',
            data: JSON.stringify(militaryExemptionData),
            attachmentUrl: 'https://placeholder.com/family_ledger.png',
            notes: 'Approved. Exemption certificate ready for collection at region department.',
            userId: citizen1.id,
        },
    });
    await prisma.statusHistory.createMany({
        data: [
            {
                applicationId: app2.id,
                status: 'PENDING',
                notes: 'Exemption request submitted.',
                changedBy: 'System',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },
            {
                applicationId: app2.id,
                status: 'UNDER_REVIEW',
                notes: 'Reviewing family status documentation and national birth records.',
                changedBy: admin.name,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            },
            {
                applicationId: app2.id,
                status: 'APPROVED',
                notes: 'Request approved. Exemption certificate signed by recruitment officer.',
                changedBy: admin.name,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
        ],
    });
    // 5. Create Application for Citizen 2 (Nour)
    const birthCertData = {
        fullNameAr: 'نور حسن فهمي عبدالسلام',
        motherNameAr: 'سحر محمود علي الشافعي',
        fatherNameAr: 'حسن فهمي عبدالسلام حسن',
        gender: 'female',
        placeOfBirth: 'Cairo, Heliopolis',
        birthDate: '2004-08-12',
    };
    const app3 = await prisma.application.create({
        data: {
            trackingCode: 'MG-9082-1144',
            serviceType: 'BIRTH_CERTIFICATE',
            status: 'COMPLETED',
            data: JSON.stringify(birthCertData),
            attachmentUrl: null,
            notes: 'Document printed and dispatched via National Postal Service.',
            userId: citizen2.id,
        },
    });
    await prisma.statusHistory.createMany({
        data: [
            {
                applicationId: app3.id,
                status: 'PENDING',
                notes: 'Birth certificate copy requested.',
                changedBy: 'System',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: app3.id,
                status: 'APPROVED',
                notes: 'Civil record match found. Birth record matches civil registry database.',
                changedBy: admin.name,
                createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: app3.id,
                status: 'COMPLETED',
                notes: 'Printed. Delivered to courier with tracking reference EG-POST-82910.',
                changedBy: admin.name,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
        ],
    });
    // 6. Create sample notifications for Citizen 1
    await prisma.notification.createMany({
        data: [
            {
                userId: citizen1.id,
                title: 'Application Under Review',
                message: 'Your National ID application (MG-1024-5896) is now under review.',
                type: 'info',
                link: '/dashboard',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
            {
                userId: citizen1.id,
                title: 'Application Approved',
                message: 'Your Military Exemption application (MG-3054-9981) has been approved.',
                type: 'success',
                link: '/dashboard',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
        ],
    });
    // 7. Create sample complaint from Citizen 2
    await prisma.complaint.create({
        data: {
            userId: citizen2.id,
            category: 'SERVICE_QUALITY',
            subject: 'Long processing time for birth certificate',
            message: 'My birth certificate application took 10 days to process. This seems too long for a digital service. Can you improve the processing time?',
            status: 'RESOLVED',
            response: 'Thank you for your feedback. We are working on reducing processing times through automation.',
            respondedBy: admin.name,
        },
    });
    // 8. Create sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    await prisma.appointment.createMany({
        data: [
            {
                userId: citizen1.id,
                department: 'PASSPORT_OFFICE',
                date: tomorrow,
                timeSlot: '10:00-10:30',
                status: 'SCHEDULED',
                notes: 'Passport renewal application supporting documents.',
            },
            {
                userId: citizen2.id,
                department: 'CIVIL_REGISTRY',
                date: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
                timeSlot: '11:30-12:00',
                status: 'CONFIRMED',
            },
        ],
    });
    // 9. Create sample rating for completed application
    await prisma.serviceRating.create({
        data: {
            applicationId: app3.id,
            userId: citizen2.id,
            score: 4,
            review: 'The birth certificate was processed quickly and delivered on time. Very satisfied with the digital service.',
        },
    });
    // 10. Create sample activity logs
    await prisma.activityLog.createMany({
        data: [
            {
                userId: citizen1.id,
                userName: 'Zeyad Ahmed Ali',
                action: 'SUBMIT_APPLICATION',
                details: 'Submitted NATIONAL_ID application with tracking code MG-1024-5896',
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            },
            {
                userId: admin.id,
                userName: 'General Khaled Mahmoud',
                action: 'UPDATE_APPLICATION_STATUS',
                details: 'Status changed to UNDER_REVIEW for application MG-1024-5896',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
            {
                userId: admin.id,
                userName: 'General Khaled Mahmoud',
                action: 'UPDATE_APPLICATION_STATUS',
                details: 'Status changed to APPROVED for application MG-3054-9981',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                userName: 'System',
                action: 'SYSTEM_STARTUP',
                details: 'MisrGate API server started and database seeded.',
                createdAt: new Date(),
            },
        ],
    });
    console.log('[Seed] Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
