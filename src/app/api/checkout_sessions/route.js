import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

export async function POST(request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    // Get the amount from form data
    const formData = await request.formData()
    const amountInCents = parseInt(formData.get('amount'), 10)

    // Validate amount (minimum $1 = 100 cents)
    if (!amountInCents || amountInCents < 100) {
      return NextResponse.json(
        { error: 'Invalid donation amount. Minimum is $1.' },
        { status: 400 }
      )
    }

    // Cap at reasonable maximum ($10,000)
    if (amountInCents > 1000000) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum allowed.' },
        { status: 400 }
      )
    }

    // Create Checkout Session with dynamic amount
    // Using price_data instead of a fixed price ID for custom amounts
    const session = await stripe.checkout.sessions.create({
      submit_type: 'donate',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to OTV Rankings',
              description: 'Thank you for supporting our platform!',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/support-us/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/support-us/donate?canceled=true`,
    })

    // Return URL for client-side redirect
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: err.statusCode || 500 }
    )
  }
}
