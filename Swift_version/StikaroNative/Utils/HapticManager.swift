import UIKit

final class HapticManager {
    static let shared = HapticManager()
    private init() {}

    /// Check if haptics are enabled before calling any trigger.
    var isEnabled: Bool = true

    private lazy var lightGenerator = UIImpactFeedbackGenerator(style: .light)
    private lazy var mediumGenerator = UIImpactFeedbackGenerator(style: .medium)
    private lazy var heavyGenerator = UIImpactFeedbackGenerator(style: .heavy)
    private lazy var notificationGenerator = UINotificationFeedbackGenerator()
    private lazy var selectionGenerator = UISelectionFeedbackGenerator()

    func selection() {
        guard isEnabled else { return }
        selectionGenerator.selectionChanged()
    }

    func snap() {
        guard isEnabled else { return }
        lightGenerator.impactOccurred()
    }

    func error() {
        guard isEnabled else { return }
        notificationGenerator.notificationOccurred(.error)
    }

    func success() {
        guard isEnabled else { return }
        notificationGenerator.notificationOccurred(.success)
    }

    func warning() {
        guard isEnabled else { return }
        notificationGenerator.notificationOccurred(.warning)
    }

    func light() {
        guard isEnabled else { return }
        lightGenerator.impactOccurred()
    }

    func medium() {
        guard isEnabled else { return }
        mediumGenerator.impactOccurred()
    }

    func heavy() {
        guard isEnabled else { return }
        heavyGenerator.impactOccurred()
    }
}
