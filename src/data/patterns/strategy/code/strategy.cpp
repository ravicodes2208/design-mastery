// ============================================================
// STRATEGY PATTERN - Payment System
// The Context stays. The Strategy swaps.
// ============================================================
#include <iostream>
#include <string>
#include <memory>
using namespace std;

// STEP 1: Strategy Interface
// WHY: Abstract class with pure virtual function = C++ equivalent of interface.
class PaymentStrategy {
public:
    // WHY: Virtual destructor is CRITICAL in C++. Without it, deleting
    // through a base pointer causes undefined behavior (memory leak/crash).
    virtual ~PaymentStrategy() = default;

    // WHY: "= 0" means pure virtual -- subclasses MUST implement pay().
    virtual void pay(double amount) = 0;
};

// STEP 2: Concrete Strategies
// WHY: Each payment method is its OWN class. SRP -- CreditCardPayment
// knows ONLY about credit cards.
class CreditCardPayment : public PaymentStrategy {
private:
    string cardNumber;
    string cardHolder;
public:
    // WHY: std::move avoids copying strings -- transfers ownership.
    CreditCardPayment(string number, string holder)
        : cardNumber(std::move(number)), cardHolder(std::move(holder)) {}

    // WHY: "override" tells compiler to verify this matches base class.
    // Catches signature mismatches at compile time. Safety net.
    void pay(double amount) override {
        cout << "Paid $" << amount << " via Credit Card: ****"
             << cardNumber.substr(cardNumber.length() - 4) << endl;
    }
};

// WHY: Adding PayPal required ZERO changes to CreditCardPayment. OCP.
class PayPalPayment : public PaymentStrategy {
private:
    string email;
public:
    // WHY: explicit prevents accidental implicit conversions.
    explicit PayPalPayment(string email) : email(std::move(email)) {}

    void pay(double amount) override {
        cout << "Paid $" << amount << " via PayPal: " << email << endl;
    }
};

class CryptoPayment : public PaymentStrategy {
private:
    string walletAddress;
public:
    explicit CryptoPayment(string wallet) : walletAddress(std::move(wallet)) {}

    void pay(double amount) override {
        cout << "Paid $" << amount << " via Crypto: " << walletAddress << endl;
    }
};

// STEP 3: Context
// WHY: Knows NOTHING about concrete payment types. Only knows the interface.
class PaymentProcessor {
private:
    // WHY: unique_ptr owns the strategy. When you set a new strategy,
    // the old one is auto-destroyed. No manual delete. RAII.
    unique_ptr<PaymentStrategy> strategy;
public:
    // WHY: std::move transfers ownership. Clear semantics.
    void setStrategy(unique_ptr<PaymentStrategy> newStrategy) {
        strategy = std::move(newStrategy);
    }

    void processPayment(double amount) {
        if (!strategy) throw runtime_error("Strategy not set!");
        // ========== THE MAGIC LINE ==========
        strategy->pay(amount);
    }
};

// STEP 4: Client
int main() {
    PaymentProcessor processor;

    processor.setStrategy(make_unique<CreditCardPayment>("4111111111111234", "Ravi"));
    processor.processPayment(99.99);

    processor.setStrategy(make_unique<PayPalPayment>("ravi@email.com"));
    processor.processPayment(49.99);

    processor.setStrategy(make_unique<CryptoPayment>("0xABC123"));
    processor.processPayment(199.99);

    return 0;
}