# TODO: Fix Billing Issues

## Issues to Fix:
1. **Page refresh needed after leaving billing**: Add beforeUnmount to clear state
2. **Client search fails**: Improve cedula input handling (trim, leading zeros)
3. **Product/service details not working**:
   - Subtotal not showing
   - Can't add items to invoice
   - Add product button not working
4. **History loading forever**: Handle empty invoice lists properly

## Files to Modify:
- src/views/Facturacion.vue
- src/views/HistorialFacturas.vue

## Progress:
- [ ] Fix Facturacion.vue state management and product details
- [ ] Fix HistorialFacturas.vue loading state
