// ============================================================
// STRATEGY PATTERN - Payment System
// The Context stays. The Strategy swaps.
// ============================================================

// STEP 1: Strategy Interface
// WHY: Kotlin interfaces are clean -- no boilerplate, no abstract keyword.
// This is the contract every payment method must follow.
interface PaymentStrategy {
    fun pay(amount: Double)
}

// STEP 2: Concrete Strategies
// WHY: Each class has a single responsibility -- its own payment logic.
// Data class-like conciseness with constructor properties.
class CreditCardPayment(
    // WHY: private val = immutable, encapsulated. Only this class accesses card details.
    private val cardNumber: String,
    private val cardHolder: String
) : PaymentStrategy {

    // WHY: override keyword is MANDATORY in Kotlin (unlike Java's optional @Override).
    // Kotlin enforces safety -- you can't accidentally shadow a method.
    override fun pay(amount: Double) {
        // WHY: takeLast(4) -- Kotlin's stdlib makes string ops concise and safe.
        val masked = "****${cardNumber.takeLast(4)}"
        println("Paid $$amount via Credit Card: $masked")
    }
}

// WHY: Independent class. Adding PayPal = ZERO changes elsewhere. OCP.
class PayPalPayment(
    private val email: String
) : PaymentStrategy {
    override fun pay(amount: Double) {
        // WHY: String templates ($variable) -- cleaner than concatenation.
        println("Paid $$amount via PayPal: $email")
    }
}

class CryptoPayment(
    private val walletAddress: String
) : PaymentStrategy {
    override fun pay(amount: Double) {
        println("Paid $$amount via Crypto: $walletAddress")
    }
}

// STEP 3: Context
// WHY: Context holds the interface type, not concrete. Pure delegation.
class PaymentProcessor {
    // WHY: lateinit = "I promise to set this before using it."
    // Alternative: nullable with null check (var strategy: PaymentStrategy? = null)
    private lateinit var strategy: PaymentStrategy

    // WHY: Simple setter. Kotlin properties make this even cleaner.
    fun setStrategy(strategy: PaymentStrategy) {
        this.strategy = strategy
    }

    fun processPayment(amount: Double) {
        // WHY: ::isInitialized check prevents UninitializedPropertyAccessException.
        check(::strategy.isInitialized) { "Payment strategy not set!" }
        // ========== THE MAGIC LINE ==========
        strategy.pay(amount)
    }
}

// STEP 4: Client
fun main() {
    val processor = PaymentProcessor()

    // WHY: CLIENT decides. val = immutable reference, but we swap via setter.
    processor.setStrategy(CreditCardPayment("4111111111111234", "Ravi"))
    processor.processPayment(99.99)

    processor.setStrategy(PayPalPayment("ravi@email.com"))
    processor.processPayment(49.99)

    processor.setStrategy(CryptoPayment("0xABC123"))
    processor.processPayment(199.99)
}

// BONUS: Kotlin can use lambdas as strategies (functional approach)
// WHY: For simple single-method strategies, a lambda IS the strategy.
fun mainFunctional() {
    // WHY: typealias makes intent clear -- this IS a payment strategy.
    // No need for a full interface when the strategy is just one function.
    val creditCard: (Double) -> Unit = { amount ->
        println("Lambda CC: Paid $$amount")
    }
    val paypal: (Double) -> Unit = { amount ->
        println("Lambda PayPal: Paid $$amount")
    }

    var currentStrategy = creditCard
    currentStrategy(99.99)   // Lambda CC: Paid $99.99

    currentStrategy = paypal
    currentStrategy(49.99)   // Lambda PayPal: Paid $49.99
}