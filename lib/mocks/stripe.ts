// Mock Stripe for staging - does nothing but won't crash

export const stripe = {
  customers: {
    create: async () => ({ id: 'cus_mock_staging' }),
    retrieve: async () => ({ id: 'cus_mock_staging', email: 'staging@test.com' }),
  },
  checkout: {
    sessions: {
      create: async () => ({ id: 'cs_mock', url: '#staging-mode' }),
    },
  },
  subscriptions: {
    list: async () => ({ data: [] }),
    retrieve: async () => ({ id: 'sub_mock', status: 'active' }),
  },
  paymentIntents: {
    create: async () => ({ id: 'pi_mock', client_secret: 'mock_secret' }),
    retrieve: async () => ({ id: 'pi_mock', status: 'succeeded' }),
  },
  prices: {
    list: async () => ({ data: [] }),
  },
  products: {
    list: async () => ({ data: [] }),
  },
  webhooks: {
    constructEvent: () => ({ type: 'mock.event', data: { object: {} } }),
  },
}

export default stripe
