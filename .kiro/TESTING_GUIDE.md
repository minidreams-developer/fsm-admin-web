# Testing Guide - State Management Implementation

## Quick Start Testing

### Prerequisites
- Application running (`npm run dev`)
- Browser DevTools open (F12)
- Console tab visible

---

## Test Suite 1: Data Persistence

### Test 1.1: Lead Creation Persists
```
Steps:
1. Navigate to LeadsPage
2. Click "Add New Lead"
3. Fill form:
   - Name: "Test Lead"
   - Phone: "9999999999"
   - Address: "Test Address"
   - Services: Select any service
4. Click "Save Lead"
5. Verify toast: "Lead created successfully!"
6. Refresh page (Ctrl+R)
7. Verify: Lead still visible in table

Expected Result: ✅ Lead persists after refresh
```

### Test 1.2: Lead Status Changes Persist
```
Steps:
1. Navigate to LeadsPage
2. Find a lead with "New" status
3. Click "Mark Contacted"
4. Verify toast: "Lead marked as contacted"
5. Verify: Lead moved to "Contacted" section
6. Refresh page (Ctrl+R)
7. Verify: Lead still in "Contacted" section

Expected Result: ✅ Status change persists after refresh
```

### Test 1.3: Quote Data Persists
```
Steps:
1. Navigate to LeadsPage
2. Find a lead with "Contacted" status
3. Click "Send Quote"
4. Fill form:
   - Amount: "5000"
   - Contract: "3 Months"
   - Details: "Test quote"
5. Click "Send Quote"
6. Verify toast: "Quote sent successfully!"
7. Refresh page (Ctrl+R)
8. Verify: Lead in "Quote Sent" section with quote data

Expected Result: ✅ Quote data persists after refresh
```

---

## Test Suite 2: Data Flow (Lead → Project → Service)

### Test 2.1: Lead to Project Conversion
```
Steps:
1. Navigate to LeadsPage
2. Find a lead with "Quote Sent" status and "Viewed" quote
3. Click "Convert to Project"
4. Verify: Redirected to ProjectsPage
5. Verify: Form pre-filled with lead data:
   - Customer Name: matches lead name
   - Phone: matches lead phone
   - Address: matches lead address
   - Service: matches lead service
   - Contract: matches quote contract
   - Estimated Value: matches quote amount
6. Refresh page (Ctrl+R)
7. Verify: Form still pre-filled

Expected Result: ✅ Form pre-fills and persists on refresh
```

### Test 2.2: Create Work Order from Lead
```
Steps:
1. Continue from Test 2.1 (form pre-filled)
2. Click "Create Work Order"
3. Verify toast: "Work Order created successfully!"
4. Verify: Success message appears
5. Verify: New work order appears in table
6. Verify: Lead status changed to "Converted" (check LeadsPage)
7. Refresh page (Ctrl+R)
8. Verify: Work order still in table

Expected Result: ✅ Work order created and persists
```

### Test 2.3: Project to Service Assignment
```
Steps:
1. Navigate to ProjectsPage
2. Find the work order created in Test 2.2
3. Click "Edit" icon
4. Click "Assign Service"
5. Verify: Redirected to ServicesPage
6. Verify: Form pre-filled with work order data:
   - Work Order ID: matches WO ID
   - Customer: matches customer name
   - Address: matches address
   - Service Type: matches service
7. Fill appointment details:
   - Date: Select any date
   - Time: Select any time
   - Technician: Select "Safeeq"
   - Add a task: "Test task"
8. Click "Assign Service"
9. Verify toast: "Service appointment created successfully!"
10. Verify: Appointment appears in table
11. Refresh page (Ctrl+R)
12. Verify: Appointment still in table

Expected Result: ✅ Service appointment created and persists
```

---

## Test Suite 3: URL Parameters

### Test 3.1: Direct URL Access - Lead Conversion
```
Steps:
1. Navigate to LeadsPage
2. Find a lead with ID (e.g., lead #3)
3. Copy URL: /projects?convertLeadId=3
4. Open new tab
5. Paste URL directly
6. Verify: ProjectsPage loads
7. Verify: Form pre-filled with lead #3 data
8. Verify: No errors in console

Expected Result: ✅ Direct URL access works correctly
```

### Test 3.2: Direct URL Access - Service Assignment
```
Steps:
1. Navigate to ProjectsPage
2. Find a work order ID (e.g., WO-1025)
3. Copy URL: /services?workOrderId=WO-1025
4. Open new tab
5. Paste URL directly
6. Verify: ServicesPage loads
7. Verify: Form pre-filled with work order data
8. Verify: No errors in console

Expected Result: ✅ Direct URL access works correctly
```

---

## Test Suite 4: Browser Navigation

### Test 4.1: Back Button Navigation
```
Steps:
1. Navigate: LeadsPage → ProjectsPage → ServicesPage
2. At each step, verify data loads correctly
3. Click browser back button
4. Verify: Returns to previous page
5. Verify: All data still visible
6. Verify: No data loss
7. Repeat back button multiple times
8. Verify: All pages load correctly

Expected Result: ✅ Back button works, data persists
```

### Test 4.2: Forward Button Navigation
```
Steps:
1. Navigate: LeadsPage → ProjectsPage → ServicesPage
2. Click back button twice (back to LeadsPage)
3. Click forward button
4. Verify: Returns to ProjectsPage
5. Verify: All data still visible
6. Click forward button again
7. Verify: Returns to ServicesPage
8. Verify: All data still visible

Expected Result: ✅ Forward button works, data persists
```

---

## Test Suite 5: Toast Notifications

### Test 5.1: Success Toasts
```
Steps:
1. LeadsPage: Click "Mark Contacted" → Verify toast
2. LeadsPage: Click "Send Quote" → Verify toast
3. ProjectsPage: Click "Create Work Order" → Verify toast
4. ServicesPage: Click "Assign Service" → Verify toast

Expected Result: ✅ All success toasts appear
```

### Test 5.2: Error Toasts
```
Steps:
1. LeadsPage: Click "Send Quote" without filling form → Verify error toast
2. ProjectsPage: Click "Create Work Order" without filling form → Verify error toast
3. ServicesPage: Click "Assign Service" without selecting technician → Verify error toast

Expected Result: ✅ All error toasts appear with helpful messages
```

---

## Test Suite 6: Form Validation

### Test 6.1: Required Fields
```
Steps:
1. ProjectsPage: Click "Create Work Order"
2. Leave all fields empty
3. Click "Create Work Order"
4. Verify: Error toast appears
5. Verify: Form doesn't submit

Expected Result: ✅ Validation prevents empty submissions
```

### Test 6.2: Field Pre-filling
```
Steps:
1. LeadsPage: Send quote to lead
2. Click "Convert to Project"
3. Verify: All fields pre-filled correctly
4. Modify one field
5. Refresh page
6. Verify: Modified field still shows new value

Expected Result: ✅ Pre-filled data persists after modification
```

---

## Test Suite 7: Data Consistency

### Test 7.1: Lead Status Sync
```
Steps:
1. LeadsPage: Mark lead as "Contacted"
2. Navigate to ProjectsPage
3. Navigate back to LeadsPage
4. Verify: Lead still shows "Contacted" status

Expected Result: ✅ Status consistent across navigation
```

### Test 7.2: Work Order Data Sync
```
Steps:
1. ProjectsPage: Create work order
2. Navigate to ServicesPage
3. Assign service to work order
4. Navigate back to ProjectsPage
5. Verify: Work order still visible with same data

Expected Result: ✅ Work order data consistent
```

### Test 7.3: Service Appointment Sync
```
Steps:
1. ServicesPage: Create service appointment
2. Refresh page
3. Verify: Appointment still visible
4. Navigate to ProjectsPage
5. Navigate back to ServicesPage
6. Verify: Appointment still visible

Expected Result: ✅ Appointment data consistent
```

---

## Test Suite 8: localStorage Verification

### Test 8.1: Check localStorage Contents
```
Steps:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Local Storage"
4. Click current domain
5. Verify: Three stores visible:
   - leads-store
   - projects-store
   - services-store
6. Click each store
7. Verify: Data is stored as JSON

Expected Result: ✅ All stores persisting to localStorage
```

### Test 8.2: Clear localStorage and Verify Reset
```
Steps:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Right-click "Local Storage"
4. Click "Clear All"
5. Refresh page
6. Verify: All data reset to initial state
7. Verify: Mock data reappears

Expected Result: ✅ localStorage properly cleared and reset
```

---

## Test Suite 9: Edge Cases

### Test 9.1: Multiple Tabs
```
Steps:
1. Open LeadsPage in Tab 1
2. Open LeadsPage in Tab 2
3. In Tab 1: Create new lead
4. Switch to Tab 2
5. Refresh Tab 2
6. Verify: New lead appears in Tab 2

Expected Result: ✅ Data syncs across tabs
```

### Test 9.2: Rapid Navigation
```
Steps:
1. Rapidly click between LeadsPage, ProjectsPage, ServicesPage
2. Verify: No data loss
3. Verify: No console errors
4. Verify: All pages load correctly

Expected Result: ✅ Rapid navigation handled correctly
```

### Test 9.3: Form Submission During Navigation
```
Steps:
1. ProjectsPage: Start filling form
2. Before submitting, navigate to LeadsPage
3. Navigate back to ProjectsPage
4. Verify: Form data cleared (new form)

Expected Result: ✅ Form resets on navigation
```

---

## Test Suite 10: Console Verification

### Test 10.1: No Console Errors
```
Steps:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform all tests above
4. Verify: No red error messages
5. Verify: No warnings about missing data

Expected Result: ✅ No console errors
```

### Test 10.2: Store Debugging
```
Steps:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: localStorage.getItem('leads-store')
4. Verify: JSON data appears
5. Type: JSON.parse(localStorage.getItem('leads-store'))
6. Verify: Structured data visible

Expected Result: ✅ Store data accessible and valid
```

---

## Automated Testing (Future)

### Unit Tests
```typescript
// Example: leadsStore.test.ts
describe('leadsStore', () => {
  it('should add a lead', () => {
    const { addLead, leads } = useLeadsStore.getState();
    addLead({ name: 'Test', ... });
    expect(leads.length).toBeGreaterThan(0);
  });
  
  it('should update a lead', () => {
    const { updateLead, getLead } = useLeadsStore.getState();
    updateLead(1, { status: 'Contacted' });
    expect(getLead(1)?.status).toBe('Contacted');
  });
});
```

### Integration Tests
```typescript
// Example: lead-to-project-flow.test.ts
describe('Lead to Project Flow', () => {
  it('should convert lead to project', () => {
    // Create lead
    // Send quote
    // Convert to project
    // Verify work order created
  });
});
```

---

## Performance Testing

### Test 10.1: Load Time
```
Steps:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click "Record"
4. Navigate through all pages
5. Click "Stop"
6. Verify: Load times < 1 second
7. Verify: No long tasks

Expected Result: ✅ Good performance
```

### Test 10.2: Memory Usage
```
Steps:
1. Open DevTools (F12)
2. Go to Memory tab
3. Take heap snapshot
4. Perform all operations
5. Take another heap snapshot
6. Compare sizes
7. Verify: No significant memory leaks

Expected Result: ✅ Reasonable memory usage
```

---

## Checklist for Complete Testing

- [ ] All data persistence tests pass
- [ ] All data flow tests pass
- [ ] All URL parameter tests pass
- [ ] All browser navigation tests pass
- [ ] All toast notification tests pass
- [ ] All form validation tests pass
- [ ] All data consistency tests pass
- [ ] localStorage verification passes
- [ ] All edge cases handled
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Memory usage reasonable

---

## Troubleshooting Test Failures

### Issue: Data not persisting
**Check**:
1. Is localStorage enabled in browser?
2. Are stores using persist middleware?
3. Check localStorage contents in DevTools

### Issue: Form not pre-filling
**Check**:
1. Is URL parameter correct?
2. Is store data available?
3. Check console for errors

### Issue: Navigation not working
**Check**:
1. Are routes configured correctly?
2. Is navigate() being called?
3. Check console for routing errors

### Issue: Toast not appearing
**Check**:
1. Is Sonner provider in App.tsx?
2. Is toast imported correctly?
3. Check console for errors

---

## Success Criteria

All tests pass when:
- ✅ Data persists across page refreshes
- ✅ Data persists across browser navigation
- ✅ Direct URL access works correctly
- ✅ Forms pre-fill with correct data
- ✅ All user actions show feedback
- ✅ No console errors
- ✅ Performance is acceptable
- ✅ No data loss in any scenario
