npx openapi-typescript https://creditselection-gateway-v2.svc.bearlake.dev.lan/swagger/customers/swagger.json -o ./src/common/types/generated/customer.svc.types.ts
npx openapi-typescript https://creditselection-gateway-v2.svc.bearlake.dev.lan/credit-selection/swagger.json -o ./src/generated/credit-selection.svc.types.ts
npx openapi-typescript https://id.master.sravni.tech/swagger/v1/swagger.json -o ./src/common/types/generated/identity-service.svc.types.ts

