// ============================================================
// FACTORY PATTERN - Notification System
// Don't create objects yourself -- ask a Factory.
// ============================================================
#include <iostream>
#include <string>
#include <memory>
#include <unordered_map>
#include <functional>
#include <stdexcept>
using namespace std;

// STEP 1: Product Interface
// WHY: Abstract class with pure virtual functions = C++ interface.
// WHY: Virtual destructor is MANDATORY -- without it, deleting through
// a base pointer causes undefined behavior.
class Notification {
public:
    virtual ~Notification() = default;
    virtual void send(const string& message) = 0;
    virtual string getChannel() const = 0;
};

// STEP 2: Concrete Products
// WHY: Each type owns only its behavior. SRP.
class EmailNotification : public Notification {
public:
    void send(const string& message) override {
        cout << "[EMAIL] " << message << endl;
    }
    string getChannel() const override { return "EMAIL"; }
};

class SMSNotification : public Notification {
public:
    void send(const string& message) override {
        cout << "[SMS] " << message << endl;
    }
    string getChannel() const override { return "SMS"; }
};

class PushNotification : public Notification {
public:
    void send(const string& message) override {
        cout << "[PUSH] " << message << endl;
    }
    string getChannel() const override { return "PUSH"; }
};

class WhatsAppNotification : public Notification {
public:
    void send(const string& message) override {
        cout << "[WHATSAPP] " << message << endl;
    }
    string getChannel() const override { return "WHATSAPP"; }
};

// STEP 3A: Simple Factory
// WHY: unique_ptr transfers ownership to client. No memory leaks.
enum class NotificationType { EMAIL, SMS, PUSH, WHATSAPP };

class NotificationFactory {
public:
    static unique_ptr<Notification> create(NotificationType type) {
        switch (type) {
            case NotificationType::EMAIL:    return make_unique<EmailNotification>();
            case NotificationType::SMS:      return make_unique<SMSNotification>();
            case NotificationType::PUSH:     return make_unique<PushNotification>();
            case NotificationType::WHATSAPP: return make_unique<WhatsAppNotification>();
            default: throw invalid_argument("Unknown notification type");
        }
    }
};

// STEP 3B: Registry Factory
// WHY: std::function stores lambdas. No switch needed.
class NotificationRegistry {
    using Creator = function<unique_ptr<Notification>()>;
    static unordered_map<string, Creator>& registry() {
        static unordered_map<string, Creator> reg;
        return reg;
    }
public:
    static void registerType(const string& key, Creator creator) {
        registry()[key] = move(creator);
    }
    static unique_ptr<Notification> create(const string& key) {
        auto it = registry().find(key);
        if (it == registry().end())
            throw invalid_argument("Unknown type: " + key);
        return it->second();
    }
};

// STEP 4: Client
int main() {
    // Simple Factory
    auto n1 = NotificationFactory::create(NotificationType::EMAIL);
    n1->send("Order #123 confirmed!");

    auto n2 = NotificationFactory::create(NotificationType::WHATSAPP);
    n2->send("Your OTP is 9876");

    // Registry Factory
    NotificationRegistry::registerType("sms", []() {
        return make_unique<SMSNotification>();
    });
    NotificationRegistry::registerType("push", []() {
        return make_unique<PushNotification>();
    });

    auto n3 = NotificationRegistry::create("sms");
    n3->send("Payment of $99 received");

    auto n4 = NotificationRegistry::create("push");
    n4->send("Your package has shipped!");

    return 0;
}