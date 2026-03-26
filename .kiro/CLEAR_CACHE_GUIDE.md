# How to Clear Cache & See Updated Demo Data

## Problem
You're seeing old data even though we updated the mock data. This is because your browser saved the old data in **localStorage**.

## Solution: Clear localStorage

### For Chrome/Edge/Brave:
1. Press **F12** to open Developer Tools
2. Click the **Application** tab
3. On the left sidebar, click **Local Storage**
4. Click your app's URL (e.g., `http://localhost:5173`)
5. Find the entry called `leads-store`
6. Right-click it and select **Delete**
7. Press **Ctrl+R** to refresh the page

### For Firefox:
1. Press **F12** to open Developer Tools
2. Click the **Storage** tab
3. On the left, click **Local Storage**
4. Click your app's URL
5. Find `leads-store` and delete it
6. Press **Ctrl+R** to refresh

### For Safari:
1. Press **Cmd+Option+I** to open Developer Tools
2. Click **Storage** tab
3. Click **Local Storage**
4. Find your app's URL
5. Delete `leads-store`
6. Press **Cmd+R** to refresh

---

## What You'll See After Clearing

✅ **Arun Sharma** - Shows "✓ Viewed" status with "Convert to Project" button  
❌ **Safeeq** - Shows "Not Viewed" status with "Send Reminder" button  
❌ **Kkkkkk** - Shows "Not Viewed" status with "Send Reminder" button  

---

## Why This Happens

Your app uses **localStorage** to save data so it persists after refresh. When we updated the mock data, the old data was already saved in localStorage, so the app used the old data instead of the new mock data.

Clearing localStorage forces the app to use the fresh mock data from the code.

---

## After Demo

Once you demo to your client and they add their own data, localStorage will automatically save it. You won't need to clear it again unless you want to reset to the original mock data.
