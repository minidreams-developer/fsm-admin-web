# Simple Testing Steps - For Designers

## How to Test if Data Saves (Easy Steps)

### Step 1: Open the App
1. Run `npm run dev` in terminal
2. Open browser to `http://localhost:5173`
3. Go to **Leads** page

---

## Test 1: Create a Lead and Refresh

### What to Do:
1. Click **"Add New Lead"** button
2. Fill the form:
   - Name: `Test Lead`
   - Phone: `9999999999`
   - Address: `Test Address`
   - Services: Select any service
3. Click **"Save Lead"**
4. You should see a **green success message** ✓
5. **Refresh the page** (Press F5 or Ctrl+R)

### What Should Happen:
- ✅ Your lead should **STILL BE THERE**
- ✅ You should see it in the table
- ✅ No data lost!

### If It Doesn't Work:
- ❌ Lead disappears after refresh
- This means data is NOT saving properly

---

## Test 2: Mark Lead as Contacted and Refresh

### What to Do:
1. Go to **Leads** page
2. Find a lead with **"New"** status
3. Click **"Mark Contacted"** button
4. You should see a **green success message** ✓
5. Lead should move to **"Contacted"** section
6. **Refresh the page** (Press F5 or Ctrl+R)

### What Should Happen:
- ✅ Lead should **STILL BE in "Contacted"** section
- ✅ Status change should be saved
- ✅ No data lost!

---

## Test 3: Send Quote and Refresh

### What to Do:
1. Go to **Leads** page
2. Find a lead with **"Contacted"** status
3. Click **"Send Quote"** button
4. Fill the form:
   - Amount: `5000`
   - Contract: `3 Months`
   - Details: `Test quote`
5. Click **"Send Quote"**
6. You should see a **green success message** ✓
7. **Refresh the page** (Press F5 or Ctrl+R)

### What Should Happen:
- ✅ Lead should **STILL BE in "Quote Sent"** section
- ✅ Quote data should be saved
- ✅ No data lost!

---

## Test 4: Convert to Project and Refresh

### What to Do:
1. Go to **Leads** page
2. Find a lead with **"Quote Sent"** status
3. Click **"Convert to Project"** button
4. You should be taken to **Projects** page
5. Form should be **pre-filled** with lead data
6. **Refresh the page** (Press F5 or Ctrl+R)

### What Should Happen:
- ✅ Form should **STILL BE PRE-FILLED**
- ✅ All data should be there:
  - Customer Name
  - Phone
  - Address
  - Service
  - Amount
- ✅ No data lost!

---

## Test 5: Create Work Order and Refresh

### What to Do:
1. Continue from Test 4 (form pre-filled)
2. Click **"Create Work Order"** button
3. You should see a **green success message** ✓
4. New work order should appear in table
5. **Refresh the page** (Press F5 or Ctrl+R)

### What Should Happen:
- ✅ Work order should **STILL BE IN TABLE**
- ✅ All data should be saved
- ✅ No data lost!

---

## Test 6: Assign Service and Refresh

### What to Do:
1. Go to **Projects** page
2. Find the work order you created
3. Click **"Edit"** icon (pencil)
4. Click **"Assign Service"** button
5. You should be taken to **Services** page
6. Form should be **pre-filled** with work order data
7. Fill appointment details:
   - Date: Select any date
   - Time: Select any time
   - Technician: Select "Safeeq"
8. Click **"Assign Service"**
9. You should see a **green success message** ✓
10. **Refresh the page** (Press F5 or Ctrl+R)

### What Should Happen:
- ✅ Service appointment should **STILL BE IN TABLE**
- ✅ All data should be saved
- ✅ No data lost!

---

## How to Check Browser Storage (Advanced)

### If You Want to See Where Data is Saved:

1. Open browser **DevTools** (Press F12)
2. Click **"Application"** tab (or "Storage" tab)
3. Click **"Local Storage"** on left side
4. Click your domain (e.g., `localhost:5173`)
5. You should see three items:
   - `leads-store`
   - `projects-store`
   - `services-store`

### What You'll See:
- All your data is stored here
- It's like a filing cabinet in the browser
- This is why data persists after refresh!

---

## Quick Checklist

- [ ] Create lead → Refresh → Lead still there ✓
- [ ] Mark contacted → Refresh → Status still changed ✓
- [ ] Send quote → Refresh → Quote still there ✓
- [ ] Convert to project → Refresh → Form still pre-filled ✓
- [ ] Create work order → Refresh → Work order still there ✓
- [ ] Assign service → Refresh → Service still there ✓

**If all checkmarks are ✓, then data saving is working!**

---

## What Success Looks Like

### Green Success Messages You Should See:
- ✓ "Lead marked as contacted"
- ✓ "Quote sent successfully!"
- ✓ "Work Order created successfully!"
- ✓ "Service appointment created successfully!"

### Data Persistence You Should See:
- ✓ Leads stay in their status sections after refresh
- ✓ Forms pre-fill with previous data
- ✓ Work orders appear in table after refresh
- ✓ Service appointments appear in table after refresh

---

## If Something Goes Wrong

### Problem: Data disappears after refresh
**Solution**: 
1. Close browser completely
2. Open browser again
3. Go to app
4. Try again

### Problem: Form doesn't pre-fill
**Solution**:
1. Make sure you're on the right page
2. Check URL has the correct ID (e.g., `?convertLeadId=3`)
3. Refresh page

### Problem: No success message appears
**Solution**:
1. Check if you filled all required fields
2. Look for error message instead
3. Try again

---

## Summary

**What was fixed:**
- Data now saves automatically
- Data persists after page refresh
- Forms pre-fill with previous data
- Users see success messages

**How to test:**
1. Create something
2. Refresh page
3. Check if it's still there
4. If yes ✓ → It's working!
5. If no ✗ → Something is wrong

**That's it!** 🎉
