import { PrismaClient, TenantStatus, RentStatus, PaymentMethod, TemplateType, MessageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PG Rent Manager database...');

  // 1. Property Setup
  const property = await prisma.property.upsert({
    where: { id: 'default-property-id' },
    update: {},
    create: {
      id: 'default-property-id',
      name: 'Sunshine Luxury PG & Hostel',
      address: '123 Main Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
      phone: '+91 98765 43210',
      email: 'manager@sunshinepg.com',
    },
  });
  console.log('Property initialized:', property.name);

  // 2. Default Message Templates
  const defaultTemplates = [
    {
      type: TemplateType.DUE_REMINDER,
      name: 'Due Date Reminder',
      content: 'Hi {{tenantName}}, your PG rent of {{amount}} for {{rentMonth}} is due on {{dueDate}}. Please complete your payment before the due date. Thank you! - {{pgName}}',
    },
    {
      type: TemplateType.DUE_TODAY,
      name: 'Due Today Alert',
      content: 'Hi {{tenantName}}, your PG rent of {{amount}} for {{rentMonth}} is due TODAY ({{dueDate}}). Kindly pay via UPI/Cash at your earliest. - {{pgName}}',
    },
    {
      type: TemplateType.OVERDUE_REMINDER,
      name: 'Overdue Notice',
      content: 'Hi {{tenantName}}, your PG rent of {{amount}} is overdue by {{daysOverdue}} days. Please complete the payment at your earliest convenience to avoid penalties. - {{pgName}}',
    },
    {
      type: TemplateType.PAYMENT_CONFIRMATION,
      name: 'Payment Receipt Confirmation',
      content: 'Hi {{tenantName}}, your payment of {{amount}} for {{rentMonth}} (Receipt #{{receiptNumber}}) has been recorded successfully. Remaining balance: {{remainingAmount}}. Thank you! - {{pgName}}',
    },
    {
      type: TemplateType.CHECKOUT_REMINDER,
      name: 'Notice Period & Checkout Notice',
      content: 'Hi {{tenantName}}, this is a reminder regarding your planned checkout date on {{checkoutDate}}. Please ensure all dues are cleared before departure. - {{pgName}}',
    },
    {
      type: TemplateType.MANUAL,
      name: 'Custom Announcement',
      content: 'Hi {{tenantName}}, {{customMessage}} - {{pgName}}',
    },
  ];

  for (const tmpl of defaultTemplates) {
    await prisma.messageTemplate.upsert({
      where: { type: tmpl.type },
      update: { content: tmpl.content, name: tmpl.name },
      create: {
        type: tmpl.type,
        name: tmpl.name,
        content: tmpl.content,
        isDefault: true,
      },
    });
  }
  console.log('Default WhatsApp message templates created.');

  // 3. Application Settings
  const settings = [
    { key: 'DEFAULT_DUE_DAY', value: '1' }, // 1st of every month
    { key: 'CURRENCY_SYMBOL', value: '₹' },
    { key: 'REMINDER_DAYS_BEFORE_DUE', value: '3' },
    { key: 'OVERDUE_REMINDER_DAYS_AFTER', value: '2' },
    { key: 'WHATSAPP_MODE', value: 'mock' },
  ];

  for (const s of settings) {
    await prisma.applicationSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log('Default application settings initialized.');

  // 4. Sample Tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { id: 'tenant-rahul-sharma' },
    update: {},
    create: {
      id: 'tenant-rahul-sharma',
      fullName: 'Rahul Sharma',
      phone: '+91 98123 45678',
      alternatePhone: '+91 98123 00000',
      email: 'rahul.sharma@example.com',
      emergencyContactName: 'Ramesh Sharma (Father)',
      emergencyContactPhone: '+91 94111 22233',
      roomNumber: '101',
      bedNumber: 'A',
      monthlyRent: 8500.00,
      depositAmount: 15000.00,
      joiningDate: new Date('2026-01-01'),
      status: TenantStatus.ACTIVE,
      notes: 'Software Engineer at Tech Corp. Prefers UPI payments.',
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { id: 'tenant-arun-kumar' },
    update: {},
    create: {
      id: 'tenant-arun-kumar',
      fullName: 'Arun Kumar',
      phone: '+91 97234 56789',
      email: 'arun.kumar@example.com',
      emergencyContactName: 'Sunita Kumar (Mother)',
      emergencyContactPhone: '+91 94222 33344',
      roomNumber: '102',
      bedNumber: 'B',
      monthlyRent: 7500.00,
      depositAmount: 12000.00,
      joiningDate: new Date('2026-02-15'),
      status: TenantStatus.ACTIVE,
      notes: 'Student at City College.',
    },
  });

  const tenant3 = await prisma.tenant.upsert({
    where: { id: 'tenant-kiran-patel' },
    update: {},
    create: {
      id: 'tenant-kiran-patel',
      fullName: 'Kiran Patel',
      phone: '+91 96345 67890',
      email: 'kiran.patel@example.com',
      emergencyContactName: 'Vijay Patel (Brother)',
      emergencyContactPhone: '+91 94333 44455',
      roomNumber: '201',
      bedNumber: 'A',
      monthlyRent: 9000.00,
      depositAmount: 18000.00,
      joiningDate: new Date('2026-03-01'),
      status: TenantStatus.ACTIVE,
      notes: 'Fintech Analyst.',
    },
  });

  const tenant4 = await prisma.tenant.upsert({
    where: { id: 'tenant-priya-singh' },
    update: {},
    create: {
      id: 'tenant-priya-singh',
      fullName: 'Priya Singh',
      phone: '+91 95456 78901',
      email: 'priya.singh@example.com',
      emergencyContactName: 'Anil Singh (Father)',
      emergencyContactPhone: '+91 94444 55566',
      roomNumber: '202',
      bedNumber: 'A',
      monthlyRent: 8000.00,
      depositAmount: 16000.00,
      joiningDate: new Date('2026-04-10'),
      status: TenantStatus.NOTICE_PERIOD,
      expectedCheckoutDate: new Date('2026-10-31'),
      notes: 'Moving out due to job relocation to Hyderabad.',
    },
  });

  console.log('Sample tenants created:', tenant1.fullName, tenant2.fullName, tenant3.fullName, tenant4.fullName);

  // 5. Sample Rent Records for Current Month (2026-09)
  const currentMonth = '2026-09';
  const dueDateSept = new Date('2026-09-01T00:00:00.000Z');

  // Rahul: Paid full ₹8,500
  const rentRahul = await prisma.rent.upsert({
    where: { tenantId_rentMonth: { tenantId: tenant1.id, rentMonth: currentMonth } },
    update: {},
    create: {
      tenantId: tenant1.id,
      rentMonth: currentMonth,
      amount: 8500.00,
      dueDate: dueDateSept,
      paidAmount: 8500.00,
      remainingAmount: 0.00,
      status: RentStatus.PAID,
      notes: 'September 2026 Rent Paid',
    },
  });

  const payRahul = await prisma.payment.upsert({
    where: { id: 'payment-rahul-sept' },
    update: {},
    create: {
      id: 'payment-rahul-sept',
      tenantId: tenant1.id,
      rentId: rentRahul.id,
      amount: 8500.00,
      paymentDate: new Date('2026-09-02T10:30:00.000Z'),
      paymentMethod: PaymentMethod.UPI,
      referenceNumber: 'UPI/628910283912/Paytm',
      notes: 'GPay payment',
    },
  });

  await prisma.receipt.upsert({
    where: { paymentId: payRahul.id },
    update: {},
    create: {
      receiptNumber: 'PG-2026-000001',
      tenantId: tenant1.id,
      rentId: rentRahul.id,
      paymentId: payRahul.id,
      amount: 8500.00,
      paymentDate: new Date('2026-09-02T10:30:00.000Z'),
      paymentMethod: 'UPI',
      remainingAmount: 0.00,
      pgName: property.name,
    },
  });

  // Arun: Partial Payment ₹3,000 paid out of ₹7,500
  const rentArun = await prisma.rent.upsert({
    where: { tenantId_rentMonth: { tenantId: tenant2.id, rentMonth: currentMonth } },
    update: {},
    create: {
      tenantId: tenant2.id,
      rentMonth: currentMonth,
      amount: 7500.00,
      dueDate: dueDateSept,
      paidAmount: 3000.00,
      remainingAmount: 4500.00,
      status: RentStatus.PARTIAL,
      notes: 'Partial payment received on 5th Sept',
    },
  });

  const payArun = await prisma.payment.upsert({
    where: { id: 'payment-arun-sept-part' },
    update: {},
    create: {
      id: 'payment-arun-sept-part',
      tenantId: tenant2.id,
      rentId: rentArun.id,
      amount: 3000.00,
      paymentDate: new Date('2026-09-05T14:15:00.000Z'),
      paymentMethod: PaymentMethod.CASH,
      referenceNumber: 'CASH-REC-102',
      notes: 'Advance partial cash payment',
    },
  });

  await prisma.receipt.upsert({
    where: { paymentId: payArun.id },
    update: {},
    create: {
      receiptNumber: 'PG-2026-000002',
      tenantId: tenant2.id,
      rentId: rentArun.id,
      paymentId: payArun.id,
      amount: 3000.00,
      paymentDate: new Date('2026-09-05T14:15:00.000Z'),
      paymentMethod: 'CASH',
      remainingAmount: 4500.00,
      pgName: property.name,
    },
  });

  // Kiran: Overdue (0 paid out of ₹9,000)
  await prisma.rent.upsert({
    where: { tenantId_rentMonth: { tenantId: tenant3.id, rentMonth: currentMonth } },
    update: {},
    create: {
      tenantId: tenant3.id,
      rentMonth: currentMonth,
      amount: 9000.00,
      dueDate: dueDateSept,
      paidAmount: 0.00,
      remainingAmount: 9000.00,
      status: RentStatus.OVERDUE,
      notes: 'Overdue rent for Sept 2026',
    },
  });

  // Priya: Pending (0 paid out of ₹8,000)
  await prisma.rent.upsert({
    where: { tenantId_rentMonth: { tenantId: tenant4.id, rentMonth: currentMonth } },
    update: {},
    create: {
      tenantId: tenant4.id,
      rentMonth: currentMonth,
      amount: 8000.00,
      dueDate: dueDateSept,
      paidAmount: 0.00,
      remainingAmount: 8000.00,
      status: RentStatus.PENDING,
      notes: 'Pending rent for Sept 2026',
    },
  });

  // 6. Audit Log Entry
  await prisma.auditLog.create({
    data: {
      action: 'DATABASE_SEEDED',
      entity: 'SYSTEM',
      details: JSON.stringify({ message: 'Sample PG data seeded successfully' }),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
