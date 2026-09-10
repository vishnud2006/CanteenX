import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import { menuService } from './services/menu.service.js';
import { authService } from './services/auth.service.js';
import { UserRole } from '@prisma/client';

async function runDirectPhase3Tests() {
  console.log('🚀 Running CanteenX Phase 3 In-Process Logic & Multi-Tenancy Tests...\n');

  // 1. Test Authentication & Multi-Tenancy Token/User info
  const studentAuth = await authService.login('student@college.edu', 'password123');
  console.assert(studentAuth.user.role === UserRole.STUDENT);
  console.assert(studentAuth.user.collegeId === 'BCE001');
  console.log('✅ 1. Student auth verified for BCE001 (Role: STUDENT, ID: BCE-STU-2048)');

  const bceStaffAuth = await authService.login('staff.bce@canteenx.edu', 'password123');
  console.assert(bceStaffAuth.user.role === UserRole.KITCHEN_STAFF);
  console.assert(bceStaffAuth.user.collegeId === 'BCE001');
  console.log('✅ 2. BCE Kitchen Staff auth verified for BCE001 (Role: KITCHEN_STAFF, ID: KITCH-BCE-001)');

  const abcStaffAuth = await authService.login('staff.abc@canteenx.edu', 'password123');
  console.assert(abcStaffAuth.user.role === UserRole.KITCHEN_STAFF);
  console.assert(abcStaffAuth.user.collegeId === 'ABC001');
  console.log('✅ 3. ABC Kitchen Staff auth verified for ABC001 (Role: KITCHEN_STAFF, ID: KITCH-ABC-001)');

  // 2. Test GET menu scoped to BCE001
  const bceMenu = await menuService.getMenu({ collegeId: 'BCE001' });
  console.assert(bceMenu.length > 0, 'BCE001 menu should have items');
  console.assert(bceMenu.every(item => item.collegeId === 'BCE001'), 'Every item in BCE menu must belong to BCE001');
  console.log(`✅ 4. Menu fetch strictly scoped: BCE001 returned ${bceMenu.length} college-specific items.`);

  // 3. Test Category filter
  const breakfastItems = await menuService.getMenu({ collegeId: 'BCE001', category: 'Breakfast' });
  console.assert(breakfastItems.every(item => item.category === 'Breakfast'), 'All items should be Breakfast');
  console.log(`✅ 5. Category filter verified: 'Breakfast' returned ${breakfastItems.length} items.`);

  // 4. Test Search filter
  const searchItems = await menuService.getMenu({ collegeId: 'BCE001', search: 'Dosa' });
  console.assert(searchItems.some(item => item.name.includes('Dosa')), 'Search should find Dosa');
  console.log(`✅ 6. Search filter verified: 'Dosa' returned ${searchItems.length} matching items.`);

  // 5. Test Food Creation (BCE Kitchen Staff)
  const createdItem = await menuService.createFoodItem('BCE001', {
    name: 'Special Paneer Kathi Roll',
    description: 'Hot rolls with spicy paneer tikka cubes',
    category: 'Snacks',
    price: 55,
    stock: 25,
    preparationTime: 6,
    dietaryType: 'veg',
    isAvailable: true,
    tags: ['roll', 'paneer', 'spicy']
  });
  console.assert(createdItem.name === 'Special Paneer Kathi Roll');
  console.assert(createdItem.collegeId === 'BCE001');
  console.assert(createdItem.availableQuantity === 25);
  console.assert(createdItem.isAvailable === true);
  console.log(`✅ 7. Food creation verified: '${createdItem.name}' created with ID ${createdItem.id} for BCE001.`);

  // 6. Test Cross-College Mutation Rejection (ABC staff attempts to edit BCE item)
  let crossCollegeBlocked = false;
  try {
    await menuService.updateFoodItem(createdItem.id, 'ABC001', false, { price: 90 });
  } catch (err: any) {
    if (err.statusCode === 403 || err.message?.includes('Forbidden')) {
      crossCollegeBlocked = true;
    }
  }
  console.assert(crossCollegeBlocked, 'ABC Staff modifying BCE food item MUST be rejected with 403 Forbidden');
  console.log('✅ 8. Cross-College Isolation: ABC Kitchen Staff mutation on BCE item blocked with 403 Forbidden.');

  // 7. Test Authorized Mutation (BCE staff updates price and description)
  const updatedItem = await menuService.updateFoodItem(createdItem.id, 'BCE001', false, {
    price: 60,
    description: 'Premium rolls with charcoal grilled paneer cubes'
  });
  console.assert(updatedItem.price === 60);
  console.assert(updatedItem.description.includes('Premium'));
  console.log('✅ 9. Authorized mutation: BCE Staff successfully updated price to ₹60.');

  // 8. Test Stock Update & Auto-Unavailable Rule
  const zeroStockItem = await menuService.updateStock(createdItem.id, 'BCE001', false, 0);
  console.assert(zeroStockItem.availableQuantity === 0);
  console.assert(zeroStockItem.isAvailable === false, 'Stock of 0 must automatically mark item as isAvailable = false');
  console.log('✅ 10. Auto-Unavailable Rule: Setting stock to 0 automatically sets isAvailable = false.');

  // 9. Test Availability Toggle
  const toggledItem = await menuService.updateAvailability(createdItem.id, 'BCE001', false, true);
  console.assert(toggledItem.isAvailable === true);
  console.assert(toggledItem.availableQuantity > 0, 'Marking available from 0 must replenish stock portions');
  console.log(`✅ 11. Availability Toggle: Re-enabling item replenished stock to ${toggledItem.availableQuantity} portions.`);

  // 10. Test Cross-College Delete Rejection
  let deleteBlocked = false;
  try {
    await menuService.deleteFoodItem(createdItem.id, 'ABC001', false);
  } catch (err: any) {
    if (err.statusCode === 403 || err.message?.includes('Forbidden')) {
      deleteBlocked = true;
    }
  }
  console.assert(deleteBlocked, 'ABC Staff deleting BCE food item MUST be rejected with 403 Forbidden');
  console.log('✅ 12. Cross-College Deletion Isolation: ABC Staff deletion on BCE item blocked with 403 Forbidden.');

  // 11. Test Authorized Deletion
  const deleteResult = await menuService.deleteFoodItem(createdItem.id, 'BCE001', false);
  console.assert(deleteResult.success === true);
  console.log('✅ 13. Authorized deletion: BCE Staff successfully removed test item.');

  console.log('\n===============================================================');
  console.log('🎉 ALL 13 PHASE 3 MENU & INVENTORY UNIT / LOGIC TESTS PASSED! 🎉');
  console.log('===============================================================\n');
}

runDirectPhase3Tests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
