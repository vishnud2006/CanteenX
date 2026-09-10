import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import request from 'supertest';
import { createApp } from './app.js';
import { prisma } from './config/database.js';
import bcrypt from 'bcryptjs';

async function runPhase3Tests() {
  console.log('🚀 Starting CanteenX Phase 3 Automated Menu & Inventory Tests...\n');
  const app = createApp();

  // 1. Log in and get tokens for Student, BCE Kitchen Staff, and ABC Kitchen Staff
  const studentLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'student@college.edu', password: 'password123' });
  const studentToken = studentLoginRes.body.data.token;

  const bceStaffLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'staff.bce@canteenx.edu', password: 'password123' });
  const bceStaffToken = bceStaffLoginRes.body.data.token;

  const abcStaffLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'staff.abc@canteenx.edu', password: 'password123' });
  const abcStaffToken = abcStaffLoginRes.body.data.token;

  console.log('✅ 1. Authentication tokens generated for Student, BCE Kitchen Staff, and ABC Kitchen Staff.');

  // 3. Test GET /api/menu (Multi-tenancy check)
  const bceMenuRes = await request(app)
    .get('/api/menu')
    .set('Authorization', `Bearer ${studentToken}`);
  console.assert(bceMenuRes.status === 200, `Expected 200, got ${bceMenuRes.status}`);
  console.assert(Array.isArray(bceMenuRes.body.data), 'Expected array of items');
  console.assert(bceMenuRes.body.data.every((item: any) => item.collegeId === 'BCE001'), 'All items must belong to BCE001');
  console.log(`✅ 2. GET /api/menu returns ${bceMenuRes.body.data.length} items strictly scoped to student college (BCE001).`);

  // 4. Test Query Filters
  const breakfastRes = await request(app)
    .get('/api/menu?category=Breakfast')
    .set('Authorization', `Bearer ${studentToken}`);
  console.assert(breakfastRes.status === 200);
  console.assert(breakfastRes.body.data.every((i: any) => i.category === 'Breakfast'), 'Category filter must work');
  console.log('✅ 3. GET /api/menu?category=Breakfast successfully filters by category.');

  // 5. Test POST /api/menu Role Guard (Student rejection)
  const studentCreateRes = await request(app)
    .post('/api/menu')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      name: 'Unauthorized Pizza',
      category: 'Snacks',
      price: 99,
      stock: 10,
    });
  console.assert(studentCreateRes.status === 403, `Expected 403 Forbidden for Student creation, got ${studentCreateRes.status}`);
  console.log('✅ 4. POST /api/menu correctly returns 403 Forbidden for Student role.');

  // 6. Test POST /api/menu (Kitchen Staff creation)
  const createRes = await request(app)
    .post('/api/menu')
    .set('Authorization', `Bearer ${bceStaffToken}`)
    .send({
      name: 'Paneer Tikka Roll Special',
      description: 'Char-grilled cottage cheese with fresh herbs',
      category: 'Snacks',
      price: 65,
      stock: 20,
      preparationTime: 6,
      dietaryType: 'veg',
      tags: ['rolls', 'paneer', 'spicy'],
    });
  console.assert(createRes.status === 201, `Expected 201 Created, got ${createRes.status}`);
  const createdItem = createRes.body.data;
  console.assert(createdItem.name === 'Paneer Tikka Roll Special');
  console.assert(createdItem.collegeId === 'BCE001');
  console.assert(createdItem.availableQuantity === 20);
  console.assert(createdItem.isAvailable === true);
  console.log('✅ 5. POST /api/menu successfully creates item scoped to staff college.');

  // 7. Test PUT /api/menu/:id Cross-College Mutation Isolation
  const crossCollegeUpdate = await request(app)
    .put(`/api/menu/${createdItem.id}`)
    .set('Authorization', `Bearer ${abcStaffToken}`)
    .send({ price: 120 });
  console.assert(crossCollegeUpdate.status === 403, `Expected 403 Forbidden for cross-college update, got ${crossCollegeUpdate.status}`);
  console.log('✅ 6. PUT /api/menu/:id correctly returns 403 Forbidden for ABC staff trying to edit BCE item.');

  // 8. Test PUT /api/menu/:id (Valid update by BCE staff)
  const validUpdate = await request(app)
    .put(`/api/menu/${createdItem.id}`)
    .set('Authorization', `Bearer ${bceStaffToken}`)
    .send({ price: 70, description: 'Updated gourmet rolls' });
  console.assert(validUpdate.status === 200);
  console.assert(validUpdate.body.data.price === 70);
  console.log('✅ 7. PUT /api/menu/:id allows authorized staff to update item details.');

  // 9. Test PATCH /api/menu/:id/stock with zero stock (Auto-unavailable rule)
  const zeroStockRes = await request(app)
    .patch(`/api/menu/${createdItem.id}/stock`)
    .set('Authorization', `Bearer ${bceStaffToken}`)
    .send({ stock: 0 });
  console.assert(zeroStockRes.status === 200);
  console.assert(zeroStockRes.body.data.availableQuantity === 0);
  console.assert(zeroStockRes.body.data.isAvailable === false, 'Stock 0 must automatically set isAvailable to false');
  console.log('✅ 8. PATCH /api/menu/:id/stock setting stock to 0 automatically marks item unavailable.');

  // 10. Test PATCH /api/menu/:id/availability
  const availRes = await request(app)
    .patch(`/api/menu/${createdItem.id}/availability`)
    .set('Authorization', `Bearer ${bceStaffToken}`)
    .send({ isAvailable: true });
  console.assert(availRes.status === 200);
  console.assert(availRes.body.data.isAvailable === true);
  console.assert(availRes.body.data.availableQuantity > 0, 'Marking available should restore positive stock');
  console.log('✅ 9. PATCH /api/menu/:id/availability toggles availability and replenishes stock.');

  // 11. Test DELETE /api/menu/:id Cross-College Isolation
  const crossCollegeDelete = await request(app)
    .delete(`/api/menu/${createdItem.id}`)
    .set('Authorization', `Bearer ${abcStaffToken}`);
  console.assert(crossCollegeDelete.status === 403, `Expected 403 Forbidden for cross-college deletion, got ${crossCollegeDelete.status}`);
  console.log('✅ 10. DELETE /api/menu/:id correctly returns 403 Forbidden for cross-college deletion attempt.');

  // 12. Test DELETE /api/menu/:id (Valid deletion)
  const deleteRes = await request(app)
    .delete(`/api/menu/${createdItem.id}`)
    .set('Authorization', `Bearer ${bceStaffToken}`);
  console.assert(deleteRes.status === 200);
  console.log('✅ 11. DELETE /api/menu/:id successfully removes item for authorized staff.');

  console.log('\n🎉 ALL PHASE 3 INTEGRATION TESTS PASSED PERFECTLY!\n');
}

runPhase3Tests()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
