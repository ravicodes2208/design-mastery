// ============================================================
// FACTORY PATTERN - Notification System
// Don't create objects yourself -- ask a Factory.
// ============================================================

// STEP 1: Product Interface
// WHY: Kotlin interfaces are clean. This is the contract.
interface Notification {
    fun send(message: String)
    fun getChannel(): String
}

// STEP 2: Concrete Products
// WHY: Each class does ONE thing. SRP.
class EmailNotification : Notification {
    override fun send(message: String) = println("[EMAIL] $message")
    override fun getChannel() = "EMAIL"
}

class SMSNotification : Notification {
    override fun send(message: String) = println("[SMS] $message")
    override fun getChannel() = "SMS"
}

class PushNotification : Notification {
    override fun send(message: String) = println("[PUSH] $message")
    override fun getChannel() = "PUSH"
}

class WhatsAppNotification : Notification {
    override fun send(message: String) = println("[WHATSAPP] $message")
    override fun getChannel() = "WHATSAPP"
}

// STEP 3A: Simple Factory using enum
// WHY: Kotlin enum + when = exhaustive, no missing cases.
enum class NotificationType { EMAIL, SMS, PUSH, WHATSAPP }

// WHY: object = Singleton factory. One instance, globally accessible.
object NotificationFactory {
    fun create(type: NotificationType): Notification = when (type) {
        NotificationType.EMAIL    -> EmailNotification()
        NotificationType.SMS      -> SMSNotification()
        NotificationType.PUSH     -> PushNotification()
        NotificationType.WHATSAPP -> WhatsAppNotification()
    }
}

// STEP 3B: Registry Factory
// WHY: Map of lambdas. Add new types without touching factory code.
object NotificationRegistry {
    private val registry = mutableMapOf<NotificationType, () -> Notification>(
        NotificationType.EMAIL    to ::EmailNotification,
        NotificationType.SMS      to ::SMSNotification,
        NotificationType.PUSH     to ::PushNotification,
        NotificationType.WHATSAPP to ::WhatsAppNotification
    )

    fun register(type: NotificationType, creator: () -> Notification) {
        registry[type] = creator
    }

    fun create(type: NotificationType): Notification {
        val creator = registry[type]
            ?: throw IllegalArgumentException("Unknown type: $type")
        return creator()
    }
}

// STEP 4: Client
fun main() {
    // Simple Factory
    val n1 = NotificationFactory.create(NotificationType.EMAIL)
    n1.send("Order #123 confirmed!")

    val n2 = NotificationFactory.create(NotificationType.WHATSAPP)
    n2.send("Your OTP is 9876")

    // Registry
    val n3 = NotificationRegistry.create(NotificationType.SMS)
    n3.send("Payment of $99 received")

    // Dynamic type from user input
    val userPref = "PUSH"
    val type = NotificationType.valueOf(userPref)
    val n4 = NotificationFactory.create(type)
    n4.send("Your package has shipped!")
}