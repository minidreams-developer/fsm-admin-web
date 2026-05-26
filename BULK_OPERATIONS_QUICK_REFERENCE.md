# Bulk Operations Quick Reference

## Current vs. Proposed Features

### ✅ Currently Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Multi-select | ✅ | Checkbox selection with Set-based tracking |
| Select All | ✅ | Selects all leads in current filtered view |
| Bulk Transfer | ✅ | Assign selected leads to Sales Executive |
| Selection Bar | ✅ | Shows count and action buttons |
| Modal Confirmation | ✅ | Preview selected leads before action |
| Toast Notifications | ✅ | Success/error feedback |

### 🎯 Recommended Additions (Priority Order)

| # | Feature | Effort | Impact | Status |
|---|---------|--------|--------|--------|
| 1 | Bulk Status Update | 2h | High | 📋 Planned |
| 2 | Bulk Assign (Multi-field) | 3h | High | 📋 Planned |
| 3 | Bulk Quote Operations | 3h | Medium | 📋 Planned |
| 4 | Bulk Delete/Archive | 2h | Medium | 📋 Planned |
| 5 | Export (CSV/Excel) | 4h | High | 📋 Planned |
| 6 | Bulk Reminders | 3h | Medium | 📋 Planned |

---

## Feature Comparison Matrix

### Bulk Transfer (Current)
```
┌─────────────────────────────────────┐
│ Bulk Transfer                       │
├─────────────────────────────────────┤
│ ✅ Multi-select                     │
│ ✅ Modal confirmation               │
│ ✅ Single field update              │
│ ✅ Toast notification               │
│ ❌ Undo capability                  │
│ ❌ Batch scheduling                 │
└─────────────────────────────────────┘
```

### Bulk Status Update (Proposed)
```
┌─────────────────────────────────────┐
│ Bulk Status Update                  │
├─────────────────────────────────────┤
│ ✅ Multi-select                     │
│ ✅ Modal confirmation               │
│ ✅ Status dropdown                  │
│ ✅ Toast notification               │
│ ✅ Lead preview                     │
│ ❌ Conditional updates              │
│ ❌ Scheduled updates                │
└─────────────────────────────────────┘
```

### Bulk Assign (Proposed)
```
┌─────────────────────────────────────┐
│ Bulk Assign (Multi-field)           │
├─────────────────────────────────────┤
│ ✅ Multi-select                     │
│ ✅ Modal confirmation               │
│ ✅ Multiple field inputs            │
│ ✅ Toast notification               │
│ ✅ Lead preview                     │
│ ✅ Selective updates                │
│ ✅ Partial updates                  │
│ ❌ Conditional logic                │
└─────────────────────────────────────┘
```

---

## User Workflows

### Workflow 1: Assign New Leads to Sales Team
```
1. Filter: Status = "New"
2. Select All (10 leads)
3. Click "Bulk Assign"
4. Set: Sales Executive = "John"
5. Confirm
6. ✅ 10 leads assigned
```

### Workflow 2: Update Follow-up Status
```
1. Filter: Status = "Follow Up"
2. Select leads (5 selected)
3. Click "Bulk Status"
4. Change to: "Contacted"
5. Confirm
6. ✅ 5 leads updated
```

### Workflow 3: Batch Quote Management
```
1. Filter: Status = "Follow Up", Quote Viewed = false
2. Select All (8 leads)
3. Click "Bulk Quote Actions"
4. Select: "Mark as Viewed"
5. Confirm
6. ✅ 8 quotes marked as viewed
```

### Workflow 4: Export for Reporting
```
1. Filter: Branch = "Kochi", Status = "Converted"
2. Select All (15 leads)
3. Click "Export"
4. Choose: "Excel"
5. ✅ File downloaded
```

### Workflow 5: Schedule Follow-ups
```
1. Filter: Status = "Contacted"
2. Select leads (12 selected)
3. Click "Bulk Assign"
4. Set: Next Follow-up Date = "2026-06-15"
5. Confirm
6. ✅ 12 follow-ups scheduled
```

---

## UI Component Specifications

### Selection Bar
```
┌────────────────────────────────────────────────────────┐
│ 5 enquiries selected                                   │
│                    [Bulk Transfer] [Bulk Status] [Clear]│
└────────────────────────────────────────────────────────┘
```

### Modal Structure
```
┌─────────────────────────────────────────────────────┐
│ [Icon] Title                                    [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Selected Leads Preview (scrollable)                │
│ ┌─────────────────────────────────────────────────┐│
│ │ • Lead 1 Name                    LEAD-0001      ││
│ │ • Lead 2 Name                    LEAD-0002      ││
│ │ • Lead 3 Name                    LEAD-0003      ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Field Inputs                                        │
│ ┌─────────────────────────────────────────────────┐│
│ │ Label: [Dropdown/Input]                         ││
│ │ Label: [Dropdown/Input]                         ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Info Message                                        │
│ ┌─────────────────────────────────────────────────┐│
│ │ ⚠️ This will update 5 leads                     ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Cancel]                              [Confirm]    │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Current Flow
```
User Selection
    ↓
Set<number> (selectedLeadIds)
    ↓
Modal Opens
    ↓
User Confirms
    ↓
forEach(id) → updateLead(id, updates)
    ↓
Store Updates
    ↓
UI Re-renders
    ↓
Toast Notification
    ↓
Selection Cleared
```

### Proposed Enhanced Flow
```
User Selection
    ↓
Set<number> (selectedLeadIds)
    ↓
Modal Opens with Preview
    ↓
User Selects Fields to Update
    ↓
User Confirms
    ↓
Validation Check
    ↓
forEach(id) → updateLead(id, updates)
    ↓
Store Updates
    ↓
Audit Log (optional)
    ↓
UI Re-renders
    ↓
Toast Notification
    ↓
Selection Cleared
```

---

## Code Snippets Reference

### Add State
```typescript
const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
const [showBulkOperation, setShowBulkOperation] = useState(false);
const [bulkData, setBulkData] = useState<Partial<Lead>>({});
```

### Toggle Selection
```typescript
const toggleSelectLead = (id: number, e: React.MouseEvent) => {
  e.stopPropagation();
  setSelectedLeadIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};
```

### Select All
```typescript
const toggleSelectAll = () => {
  if (selectedLeadIds.size === filtered.length) {
    setSelectedLeadIds(new Set());
  } else {
    setSelectedLeadIds(new Set(filtered.map(l => l.id)));
  }
};
```

### Bulk Update
```typescript
const handleBulkUpdate = (updates: Partial<Lead>) => {
  selectedLeadIds.forEach(id => updateLead(id, updates));
  toast.success(`${selectedLeadIds.size} lead(s) updated`);
  setSelectedLeadIds(new Set());
  setShowBulkOperation(false);
};
```

### Get Selected Leads
```typescript
const selectedLeads = filtered.filter(l => selectedLeadIds.has(l.id));
```

---

## Performance Considerations

### Current Implementation
- **Selection Tracking:** O(1) lookup with Set ✅
- **Bulk Updates:** O(n) where n = selected leads ✅
- **Filtering:** O(m) where m = total leads ✅
- **Pagination:** Doesn't affect selection ✅

### Optimization Opportunities
- Debounce bulk operations for 1000+ leads
- Use requestAnimationFrame for UI updates
- Memoize filtered leads calculation
- Consider virtual scrolling for large lists

### Recommended Limits
- Max selection: 1000 leads
- Max bulk operation: 500 leads at once
- Pagination: 10-100 items per page

---

## Accessibility Checklist

- [ ] Checkboxes have proper labels
- [ ] Modal has focus trap
- [ ] Keyboard navigation works
- [ ] Screen reader announces selection count
- [ ] Toast notifications are announced
- [ ] Color not only indicator (icons used)
- [ ] Sufficient contrast ratios
- [ ] ARIA labels on buttons

---

## Testing Scenarios

### Selection Tests
- [ ] Select single lead
- [ ] Select multiple leads
- [ ] Select all leads
- [ ] Deselect individual lead
- [ ] Deselect all leads
- [ ] Selection persists across pagination
- [ ] Selection clears after operation

### Operation Tests
- [ ] Bulk transfer works
- [ ] Bulk status update works
- [ ] Bulk assign works
- [ ] Bulk delete works
- [ ] Bulk export works
- [ ] Undo functionality works
- [ ] Toast notifications appear

### Edge Cases
- [ ] No leads selected
- [ ] Single lead selected
- [ ] All leads selected
- [ ] Filtered view with selection
- [ ] Pagination with selection
- [ ] Modal cancel button
- [ ] Modal close button
- [ ] Rapid successive operations

---

## Common Patterns

### Pattern 1: Simple Bulk Update
```typescript
const handleBulkUpdate = (field: string, value: any) => {
  selectedLeadIds.forEach(id => 
    updateLead(id, { [field]: value })
  );
};
```

### Pattern 2: Conditional Bulk Update
```typescript
const handleConditionalUpdate = (condition: (lead: Lead) => boolean, updates: Partial<Lead>) => {
  selectedLeadIds.forEach(id => {
    const lead = leads.find(l => l.id === id);
    if (lead && condition(lead)) {
      updateLead(id, updates);
    }
  });
};
```

### Pattern 3: Bulk Update with Validation
```typescript
const handleValidatedUpdate = (updates: Partial<Lead>) => {
  if (!validateUpdates(updates)) {
    toast.error("Invalid data");
    return;
  }
  selectedLeadIds.forEach(id => updateLead(id, updates));
};
```

---

## Keyboard Shortcuts (Future Enhancement)

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all |
| `Ctrl+D` | Deselect all |
| `Ctrl+T` | Open bulk transfer |
| `Ctrl+S` | Open bulk status |
| `Ctrl+E` | Export selected |
| `Escape` | Close modal |

---

## Metrics & Analytics

### Track These Events
- Bulk operation initiated
- Bulk operation completed
- Bulk operation cancelled
- Number of leads affected
- Operation type
- Time to complete

### Success Metrics
- Adoption rate of bulk features
- Average leads per operation
- Time saved vs. individual operations
- User satisfaction score

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| Selection not persisting | State not updated | Check `setSelectedLeadIds` call |
| Modal not opening | State not set | Verify `setShowBulkOperation(true)` |
| Updates not saving | Store not updated | Check `updateLead` implementation |
| Toast not showing | Import missing | Add `import { toast } from 'sonner'` |
| Styles not matching | Wrong classes | Copy exact Tailwind classes |

---

## Next Steps

1. **Review** this analysis with team
2. **Prioritize** features based on business needs
3. **Implement** Priority 1 features first
4. **Test** thoroughly with real data
5. **Gather** user feedback
6. **Iterate** based on feedback

