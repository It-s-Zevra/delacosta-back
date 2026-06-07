import { notion } from "../notion/client.js";
import { DATA_SOURCES } from "../notion/ids.js";
import {
  CUSTOMER_PROPS,
  customerToProps,
  toCustomer,
  type Customer,
  type CustomerInput,
} from "../mappers/customer.js";
import { HttpError } from "../utils/http-error.js";

export async function listCustomers(opts: { estado?: string } = {}): Promise<Customer[]> {
  const body: Record<string, unknown> = {};
  if (opts.estado) {
    body.filter = { property: CUSTOMER_PROPS.estado, select: { equals: opts.estado } };
  }
  const pages = await notion.queryAll(DATA_SOURCES.clientes, body);
  return pages.map(toCustomer);
}

export async function getCustomer(id: string): Promise<Customer> {
  const page = await notion.getPage(id);
  return toCustomer(page);
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const normalized = email.trim().toLowerCase();
  const pages = await notion.queryAll(DATA_SOURCES.clientes, {
    filter: { property: CUSTOMER_PROPS.email, email: { equals: normalized } },
    page_size: 1,
  });
  return pages.length > 0 ? toCustomer(pages[0]!) : null;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  if (!input.nombre) throw HttpError.badRequest("`nombre` es obligatorio");
  const payload: CustomerInput = { estado: "Nuevo", ...input };
  if (payload.email) payload.email = payload.email.trim().toLowerCase();
  const page = await notion.createPage(DATA_SOURCES.clientes, customerToProps(payload));
  return toCustomer(page);
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>,
): Promise<Customer> {
  if (input.email) input.email = input.email.trim().toLowerCase();
  const page = await notion.updatePage(id, customerToProps(input));
  return toCustomer(page);
}

/**
 * Find a customer by email or create one. Used by the checkout flow so the same
 * person isn't duplicated across orders.
 */
export async function findOrCreateCustomer(input: CustomerInput): Promise<Customer> {
  if (input.email) {
    const existing = await findCustomerByEmail(input.email);
    if (existing) return existing;
  }
  return createCustomer(input);
}
