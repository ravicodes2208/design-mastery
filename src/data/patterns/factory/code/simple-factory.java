// ============================================================
// FACTORY PATTERN - Notification System
// Don't create objects yourself -- ask a Factory.
// ============================================================
// Shows all 3 flavors: Simple Factory, Registry, Factory Method

import java.util.*;
import java.util.function.Supplier;

// STEP 1: Product Interface (the contract)
// WHY: Every notification type -- email, SMS, push -- shares this contract.
// Client code ONLY knows this interface. Never touches concrete classes.
interface Notification {
    void send(String message);
    String getChannel();
}

// STEP 2: Concrete Products
// WHY: Each notification type is its OWN class. SRP -- EmailNotification
// knows ONLY about sending emails. It doesn't know SMS exists.
class EmailNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("[EMAIL] " + message);
    }
    @Override
    public String getChannel() { return "EMAIL"; }
}

class SMSNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("[SMS] " + message);
    }
    @Override
    public String getChannel() { return "SMS"; }
}

class PushNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("[PUSH] " + message);
    }
    @Override
    public String getChannel() { return "PUSH"; }
}

class WhatsAppNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("[WHATSAPP] " + message);
    }
    @Override
    public String getChannel() { return "WHATSAPP"; }
}

// STEP 3A: Simple Factory (use this 80% of the time)
// WHY: ONE class, ONE method, all creation logic centralized.
// Add WhatsApp? ONE new case here. 10 services untouched.
enum NotificationType { EMAIL, SMS, PUSH, WHATSAPP }

class NotificationFactory {
    // WHY: Static method -- no need to instantiate the factory itself.
    // WHY: Enum input -- compile-time safety, no typos, IDE autocomplete.
    public static Notification create(NotificationType type) {
        return switch (type) {
            case EMAIL    -> new EmailNotification();
            case SMS      -> new SMSNotification();
            case PUSH     -> new PushNotification();
            case WHATSAPP -> new WhatsAppNotification();
        };
    }
}

// STEP 3B: Registry Factory (eliminates if-else entirely)
// WHY: Adding a new type = registry.put() at startup. No switch to modify.
class NotificationRegistry {
    private static final Map<NotificationType, Supplier<Notification>> registry
        = new EnumMap<>(NotificationType.class);

    static {
        registry.put(NotificationType.EMAIL,    EmailNotification::new);
        registry.put(NotificationType.SMS,      SMSNotification::new);
        registry.put(NotificationType.PUSH,     PushNotification::new);
        registry.put(NotificationType.WHATSAPP, WhatsAppNotification::new);
    }

    public static Notification create(NotificationType type) {
        Supplier<Notification> supplier = registry.get(type);
        if (supplier == null) throw new IllegalArgumentException("Unknown: " + type);
        // ========== THE MAGIC LINE ==========
        // WHY: supplier.get() calls the constructor lazily.
        // No object created until actually needed.
        return supplier.get();
    }
}

// STEP 4: Client code -- NEVER touches concrete notification classes
public class Main {
    public static void main(String[] args) {
        // Simple Factory usage
        Notification n1 = NotificationFactory.create(NotificationType.EMAIL);
        n1.send("Order #123 confirmed!");

        Notification n2 = NotificationFactory.create(NotificationType.WHATSAPP);
        n2.send("Your OTP is 9876");

        // Registry usage
        Notification n3 = NotificationRegistry.create(NotificationType.SMS);
        n3.send("Payment of $99 received");

        // Simulating a service that uses factory
        String userPref = "PUSH"; // from DB, config, or API
        NotificationType type = NotificationType.valueOf(userPref);
        Notification n4 = NotificationFactory.create(type);
        n4.send("Your package has shipped!");
    }
}