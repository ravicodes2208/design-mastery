// ============================================================
// STRATEGY PATTERN - Payment System
// The Context stays. The Strategy swaps.
// ============================================================
// NOTE: In a real project, each class goes in its own file with 'public'.
// Here all classes are in one file for the online editor to compile.

// STEP 1: Strategy Interface (the contract)
// WHY: Single method -- every payment method, no matter how different,
// boils down to one action: "process this amount".
interface PaymentStrategy {
    void pay(double amount);
}

// STEP 2: Concrete Strategies (the swappable algorithms)
// WHY: Each payment method is its OWN class. This is SRP --
// CreditCardPayment knows ONLY about credit cards.
class CreditCardPayment implements PaymentStrategy {
    // WHY: Credit card needs card details. These are specific to THIS strategy.
    // Other strategies don't need card numbers. Data stays encapsulated.
    private String cardNumber;
    private String cardHolder;

    // WHY: Constructor injection -- provide card details when creating.
    // The Context (PaymentProcessor) never sees these details.
    public CreditCardPayment(String cardNumber, String cardHolder) {
        this.cardNumber = cardNumber;
        this.cardHolder = cardHolder;
    }

    // WHY: The method signature matches the interface exactly (LSP).
    // The Context calls pay() and doesn't care what's underneath.
    @Override
    public void pay(double amount) {
        // WHY: Masking card number -- this is card-specific logic.
        // Only THIS strategy knows how to display card info safely.
        String masked = "****" + cardNumber.substring(cardNumber.length() - 4);
        System.out.println("Paid $" + amount + " via Credit Card: " + masked);
    }
}

// WHY: Completely independent class. Adding PayPal required ZERO changes
// to CreditCardPayment or PaymentProcessor. This is OCP in action.
class PayPalPayment implements PaymentStrategy {
    private String email;

    public PayPalPayment(String email) {
        this.email = email;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " via PayPal: " + email);
    }
}

// WHY: 3rd payment method. We ONLY created a new file.
// CreditCard, PayPal, and PaymentProcessor are UNTOUCHED.
class CryptoPayment implements PaymentStrategy {
    private String walletAddress;

    public CryptoPayment(String walletAddress) {
        this.walletAddress = walletAddress;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " via Crypto: " + walletAddress);
    }
}

// STEP 3: Context (the stable shell that NEVER changes)
// WHY: This class knows NOTHING about credit cards, PayPal, or crypto.
// It only knows PaymentStrategy (the interface). That's DIP.
class PaymentProcessor {
    // WHY: Field type is INTERFACE, not concrete class.
    // This single decision enables the entire pattern.
    private PaymentStrategy strategy;

    // WHY: Strategy injected from outside. Processor doesn't CREATE strategies.
    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void processPayment(double amount) {
        if (strategy == null) {
            throw new IllegalStateException("Payment strategy not set!");
        }
        // ========== THIS IS THE MAGIC LINE ==========
        // WHY: Delegates to whatever strategy is currently set.
        // This ONE line is why you can add 100 payment methods
        // and NEVER change this class.
        strategy.pay(amount);
    }
}

// STEP 4: Client wires it up
public class Main {
    public static void main(String[] args) {
        PaymentProcessor processor = new PaymentProcessor();

        // WHY: CLIENT decides the strategy. Not the processor.
        processor.setStrategy(new CreditCardPayment("4111111111111234", "Ravi"));
        processor.processPayment(99.99);

        // WHY: Swap at RUNTIME. Same processor, different behavior.
        processor.setStrategy(new PayPalPayment("ravi@email.com"));
        processor.processPayment(49.99);

        // WHY: New method? New class, zero changes above.
        processor.setStrategy(new CryptoPayment("0xABC123"));
        processor.processPayment(199.99);
    }
}