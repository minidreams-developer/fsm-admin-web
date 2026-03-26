# START HERE - Test Data Persistence (5 Minutes)

## What You Need to Do

I fixed the data saving issue. Now you need to **test if it works**.

---

## Step 1: Start the App

Open terminal and run:
```
npm run dev
```

Wait for it to say:
```
VITE v5.4.19 ready in 123 ms

➜  Local:   http://localhost:5173/
```

Then open browser to: **http://localhost:5173**

---

## Step 2: Go to Leads Page

Click on **"Leads"** in the left sidebar.

You should see a table with leads like:
- Arun Sharma
- Priya Nair
- Hotel Sunrise
- etc.

---

## Step 3: Test 1 - Create a New Lead

1. Click **"+ Add New Lead"** button (top right)
2. A form appears
3. Fill it:
   - Name: `My Test Lead`
   - Phone: `9999999999`
   - Address: `Test Address`
   - Services: Click and select any service
4. Click **"Save Lead"**
5. You should see a **green message** at top: ✓ "Lead created successfully!"
6. Your new lead appears in the table

### Now the Important Part:
7. **Press F5** (refresh page)
8. **Look at the table**

### What Should Happen:
- ✅ Your lead is **STILL THERE**
- ✅ It shows "My Test Lead" in the table
- ✅ No data lost!

**If yes → Go to Step 4**  
**If no → Something is wrong, tell me**

---

## Step 4: Test 2 - Mark as Contacted

1. Find your lead "My Test Lead" in the table
2. It should have status **"New"**
3. Click **"Mark Contacted"** button
4. You should see green message: ✓ "Lead marked as contacted"
5. Your lead should move to **"Contacted"** section

### Now the Important Part:
6. **Press F5** (refresh page)
7. **Look at the table**

### What Should Happen:
- ✅ Your lead is **STILL in "Contacted"** section
- ✅ Status is still "Contacted"
- ✅ No data lost!

**If yes → Go to Step 5**  
**If no → Something is wrong, tell me**

---

## Step 5: Test 3 - Send Quote

1. Find your lead in **"Contacted"** section
2. Click **"Send Quote"** button
3. A form appears
4. Fill it:
   - Amount (₹): `5000`
   - Contract Duration: `3 Months`
   - Quote Details: `Test quote`
5. Click **"Send Quote"**
6. You should see green message: ✓ "Quote sent successfully!"
7. Your lead should move to **"Quote Sent"** section

### Now the Important Part:
8. **Press F5** (refresh page)
9. **Look at the table**

### What Should Happen:
- ✅ Your lead is **STILL in "Quote Sent"** section
- ✅ Quote data is saved
- ✅ No data lost!

**If yes → Go to Step 6**  
**If no → Something is wrong, tell me**

---

## Step 6: Test 4 - Convert to Project

1. Find your lead in **"Quote Sent"** section
2. It should show "Viewed" status (or "Not Viewed")
3. Click **"Convert to Project"** button
4. You should be taken to **"Projects"** page
5. A form should appear with data **already filled in**:
   - Customer Name: `My Test Lead`
   - Phone: `9999999999`
   - Address: `Test Address`
   - Service: (your selected service)
   - Contract: `3 Months`
   - Amount: `5000`

### Now the Important Part:
6. **Press F5** (refresh page)
7. **Look at the form**

### What Should Happen:
- ✅ Form is **STILL PRE-FILLED**
- ✅ All data is there
- ✅ No need to re-enter anything!

**If yes → Go to Step 7**  
**If no → Something is wrong, tell me**

---

## Step 7: Test 5 - Create Work Order

1. The form is pre-filled from previous step
2. Click **"Create Work Order"** button
3. You should see green message: ✓ "Work Order created successfully!"
4. A new work order appears in the table like:
   - WO-1028 | My Test Lead | Open | ...

### Now the Important Part:
5. **Press F5** (refresh page)
6. **Look at the table**

### What Should Happen:
- ✅ Work order is **STILL IN TABLE**
- ✅ All data is saved
- ✅ No data lost!

**If yes → Go to Step 8**  
**If no → Something is wrong, tell me**

---

## Step 8: Test 6 - Assign Service

1. Find your work order in the table
2. Click the **"Edit"** icon (pencil icon) on the right
3. A detail view opens
4. Click **"Assign Service"** button
5. You should be taken to **"Services"** page
6. A form should appear with data **already filled in**:
   - Work Order: `WO-1028`
   - Customer: `My Test Lead`
   - Address: `Test Address`
   - Service Type: (your service)

### Now the Important Part:
7. Fill the remaining fields:
   - Date: Select any date
   - Time: Select any time
   - Technician: Select "Safeeq"
8. Click **"Assign Service"**
9. You should see green message: ✓ "Service appointment created successfully!"
10. A new appointment appears in the table

### Final Test:
11. **Press F5** (refresh page)
12. **Look at the table**

### What Should Happen:
- ✅ Service appointment is **STILL IN TABLE**
- ✅ All data is saved
- ✅ No data lost!

**If yes → SUCCESS! 🎉**  
**If no → Something is wrong, tell me**

---

## Summary

If you completed all 6 tests and everything worked:

✅ **Data is saving correctly**  
✅ **Data persists after refresh**  
✅ **Forms pre-fill with previous data**  
✅ **Users see success messages**  

**The app is working!** 🎉

---

## If Something Doesn't Work

### Problem: Data disappears after refresh

**Try this:**
1. Close browser completely
2. Open browser again
3. Go to http://localhost:5173
4. Try the test again

### Problem: Form doesn't pre-fill

**Try this:**
1. Make sure you're on the right page
2. Check the URL in address bar
3. It should have something like `?convertLeadId=7`
4. If not, go back and try again

### Problem: No success message appears

**Try this:**
1. Check if you filled all required fields
2. Look for an error message instead
3. Try again

### If Still Not Working

Tell me:
1. Which test failed?
2. What did you see instead?
3. Any error messages?

---

## Quick Checklist

- [ ] Test 1: Create Lead → Refresh → Still There ✓
- [ ] Test 2: Mark Contacted → Refresh → Status Changed ✓
- [ ] Test 3: Send Quote → Refresh → Quote Saved ✓
- [ ] Test 4: Convert to Project → Refresh → Form Pre-filled ✓
- [ ] Test 5: Create Work Order → Refresh → WO Saved ✓
- [ ] Test 6: Assign Service → Refresh → Service Saved ✓

**If all 6 are checked ✓ → Everything is working!**

---

## That's It!

You now know how to test if data is saving. Just follow these 6 tests and you'll know if the app is working correctly.

**Good luck!** 🚀
