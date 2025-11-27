import { Items } from "mercadopago/dist/clients/commonTypes";
import Payment from "./Payment";

export interface ItemsPayment extends Items {
  quantity: number;
  unit_price: number;
}

export interface CreatePreferenceRequest {
  items: ItemsPayment[];
  planId: number;
}

export interface CreatePreferenceResponse {
  preferenceId: string;
  payment: Payment;
}

export interface GatewayPaymentProps {
  id: number;
  preferenceId: string;
  payment: Payment;
  amount: number;
  items: ItemsPayment[];
  updated_at?: string;
  created_at?: string;
}

export interface ProcessPaymentRequest {
  transaction_amount: number;
  token: string;
  description: string;
  installments: number;
  payment_method_id: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  external_reference?: string;
}

export interface ProcessPaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  payment_method_id: string;
  payer: {
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export default class GatewayPayment {
  readonly id: number;
  readonly preferenceId: string;
  readonly payment: Payment;
  readonly amount: number;
  readonly items: ItemsPayment[];
  readonly updated_at?: string;
  readonly created_at?: string;

  constructor({
    id,
    preferenceId,
    payment,
    amount,
    items,
    updated_at,
    created_at,
  }: GatewayPaymentProps) {
    this.id = id;
    this.preferenceId = preferenceId;
    this.payment = payment;
    this.amount = amount;
    this.items = items;
    this.updated_at = updated_at;
    this.created_at = created_at;
  }
}
