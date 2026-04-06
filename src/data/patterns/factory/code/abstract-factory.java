// ABSTRACT FACTORY: Creates FAMILIES of related objects.
//
// KEY INSIGHT: What actually varies TOGETHER by country?
// NOT the payment method (India has UPI AND Credit Card AND Net Banking)
// YES the compliance rules: tax calculation + receipt format + currency
//
// The FAMILY is: TaxCalculator + ReceiptGenerator + CurrencyFormatter
// These three MUST be consistent per country. You can't mix GST tax
// with a US receipt format -- that's illegal.
//
// Payment METHOD (UPI, Credit Card, PayPal) is a SEPARATE axis --
// use Simple Factory or Strategy for that. Don't force it into families.

// ===== Product Family Interfaces =====
// These THREE always vary together by country/region.
interface TaxCalculator {
    double calculate(double amount);
    String getTaxLabel();
}

interface ReceiptGenerator {
    void generate(String txnId, double amount, double tax, String method);
}

interface CurrencyFormatter {
    String format(double amount);
    String getCurrencyCode();
}

// ===== India Family =====
// GST tax + Indian receipt format + INR currency -- ALWAYS together
class IndiaTaxCalculator implements TaxCalculator {
    public double calculate(double amount) { return amount * 0.18; }
    public String getTaxLabel() { return "GST (18%)"; }
}

class IndiaReceiptGenerator implements ReceiptGenerator {
    public void generate(String txnId, double amount, double tax, String method) {
        System.out.println("  --- GST TAX INVOICE ---");
        System.out.println("  TXN: " + txnId);
        System.out.println("  Amount: Rs." + String.format("%.2f", amount));
        System.out.println("  GST:    Rs." + String.format("%.2f", tax));
        System.out.println("  Total:  Rs." + String.format("%.2f", amount + tax));
        System.out.println("  Method: " + method);
        System.out.println("  GSTIN: 29AAACW1234F1Z5");
    }
}

class IndiaCurrencyFormatter implements CurrencyFormatter {
    public String format(double amount) {
        return "Rs." + String.format("%.2f", amount);
    }
    public String getCurrencyCode() { return "INR"; }
}

// ===== US Family =====
// State tax + US invoice format + USD currency -- ALWAYS together
class USTaxCalculator implements TaxCalculator {
    public double calculate(double amount) { return amount * 0.0825; }
    public String getTaxLabel() { return "State Tax (8.25%)"; }
}

class USReceiptGenerator implements ReceiptGenerator {
    public void generate(String txnId, double amount, double tax, String method) {
        System.out.println("  --- US INVOICE ---");
        System.out.println("  Transaction: " + txnId);
        System.out.println("  Subtotal: $" + String.format("%.2f", amount));
        System.out.println("  Tax:      $" + String.format("%.2f", tax));
        System.out.println("  Total:    $" + String.format("%.2f", amount + tax));
        System.out.println("  Paid via: " + method);
    }
}

class USCurrencyFormatter implements CurrencyFormatter {
    public String format(double amount) {
        return "$" + String.format("%.2f", amount);
    }
    public String getCurrencyCode() { return "USD"; }
}

// ===== Abstract Factory =====
// Creates a CONSISTENT compliance family per country.
// You can't mix GST tax with US receipt -- that's illegal.
interface RegionalComplianceFactory {
    TaxCalculator createTaxCalculator();
    ReceiptGenerator createReceiptGenerator();
    CurrencyFormatter createCurrencyFormatter();
}

class IndiaComplianceFactory implements RegionalComplianceFactory {
    public TaxCalculator createTaxCalculator() { return new IndiaTaxCalculator(); }
    public ReceiptGenerator createReceiptGenerator() { return new IndiaReceiptGenerator(); }
    public CurrencyFormatter createCurrencyFormatter() { return new IndiaCurrencyFormatter(); }
}

class USComplianceFactory implements RegionalComplianceFactory {
    public TaxCalculator createTaxCalculator() { return new USTaxCalculator(); }
    public ReceiptGenerator createReceiptGenerator() { return new USReceiptGenerator(); }
    public CurrencyFormatter createCurrencyFormatter() { return new USCurrencyFormatter(); }
}

// ===== Payment Method -- SEPARATE axis, NOT part of the family =====
// India can use UPI OR Credit Card. US can use Credit Card OR PayPal.
// This is Simple Factory, not Abstract Factory.
interface PaymentProcessor {
    void charge(double amount);
    String getName();
}

class UPIProcessor implements PaymentProcessor {
    public void charge(double amount) {
        System.out.println("  [UPI] Charged via NPCI");
    }
    public String getName() { return "UPI"; }
}

class CreditCardProcessor implements PaymentProcessor {
    public void charge(double amount) {
        System.out.println("  [Credit Card] Charged via card network");
    }
    public String getName() { return "Credit Card"; }
}

class PaymentProcessorFactory {
    public static PaymentProcessor create(String method) {
        return switch (method.toUpperCase()) {
            case "UPI"         -> new UPIProcessor();
            case "CREDIT_CARD" -> new CreditCardProcessor();
            default -> throw new IllegalArgumentException("Unknown: " + method);
        };
    }
}

// ===== Client: Abstract Factory (compliance) + Simple Factory (payment) =====
class CheckoutService {
    private final RegionalComplianceFactory compliance;

    CheckoutService(RegionalComplianceFactory compliance) {
        this.compliance = compliance;
    }

    void checkout(String paymentMethod, double amount) {
        TaxCalculator tax = compliance.createTaxCalculator();
        ReceiptGenerator receipt = compliance.createReceiptGenerator();
        CurrencyFormatter currency = compliance.createCurrencyFormatter();

        // Payment method chosen independently -- NOT locked to country
        PaymentProcessor processor = PaymentProcessorFactory.create(paymentMethod);

        System.out.println("=== Checkout (" + currency.getCurrencyCode() + ") ===");
        double taxAmount = tax.calculate(amount);
        System.out.println("  " + currency.format(amount) + " + " + tax.getTaxLabel() + " = " + currency.format(amount + taxAmount));
        processor.charge(amount + taxAmount);
        String txnId = "TXN-" + System.currentTimeMillis();
        receipt.generate(txnId, amount, taxAmount, processor.getName());
        System.out.println("=== Done ===");
    }
}

// Factory of Factories for region selection
class ComplianceFactoryProvider {
    public static RegionalComplianceFactory getFactory(String country) {
        return switch (country.toUpperCase()) {
            case "INDIA" -> new IndiaComplianceFactory();
            case "US"    -> new USComplianceFactory();
            default -> throw new IllegalArgumentException("Unknown: " + country);
        };
    }
}

public class Main {
    public static void main(String[] args) {
        // India user paying with UPI
        System.out.println("--- India + UPI ---");
        CheckoutService india = new CheckoutService(ComplianceFactoryProvider.getFactory("INDIA"));
        india.checkout("UPI", 999.0);

        System.out.println();

        // India user paying with CREDIT CARD (not locked to UPI!)
        System.out.println("--- India + Credit Card ---");
        india.checkout("CREDIT_CARD", 1499.0);

        System.out.println();

        // US user paying with Credit Card
        System.out.println("--- US + Credit Card ---");
        CheckoutService us = new CheckoutService(ComplianceFactoryProvider.getFactory("US"));
        us.checkout("CREDIT_CARD", 49.99);
    }
}