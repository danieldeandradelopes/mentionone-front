export interface StoreScheduleByBarberShopRequest {
  start_date: string;
  barber_id: number;
  service_ids: number[];
  customer_name: string;
  customer_phone: string;
}
