// Staging-safe Stripe wrapper
// Returns mock if no keys, real Stripe if keys exist

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

let stripe: any

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_')) {
  // Real Stripe
  const Stripe = require('stripe')
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
} else {
  // Mock Stripe for staging
  console.warn('⚠️ Stripe running in MOCK mode - no real payments')
  stripe = {
    customers: {
      create: async () => ({ id: 'cus_mock_staging' }),
      retrieve: async () => ({ id: 'cus_mock_staging' }),
      update: async () => ({ id: 'cus_mock_staging' }),
    },
    checkout: {
      sessions: {
        create: async () => ({ id: 'cs_mock', url: '/staging-no-payments' }),
        retrieve: async () => ({ id: 'cs_mock' }),
      },
    },
    subscriptions: {
      list: async () => ({ data: [] }),
      retrieve: async () => ({ id: 'sub_mock', status: 'active' }),
  update: async () => ({ id: 'sub_mock' }),
      cancel: async () => ({ id: 'sub_mock' }),
    },
    paymentIntents: {
      create: async () => ({ id: 'pi_mock', client_secret: 'mock_secret' }),
      retrieve: async () => ({ id: 'pi_mock', status: 'succeeded' }),
    },
    setupIntents: {
      create: async () => ({ id: 'seti_mock', client_secret: 'mock_secret' }),
    },
    prices: {
      list: async () => ({ data: [] }),
      retrieve: async () => ({ id: 'price_mock' }),
    },
    products: {
      list: async () => ({ data: [] }),
      retrieve: async () => ({ id: 'prod_mock' }),
    },
    invoices: {
      list: async () => ({ data: [] }),
    },
    webhooks: {
      constructEvent: () => ({ type: 'mock.event', data: { object: {} } }),
    },
  }
}

export { stripe }
export default stripe
