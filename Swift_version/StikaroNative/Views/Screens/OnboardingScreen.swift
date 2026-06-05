import SwiftUI

// MARK: - Onboarding Panel Data

private struct OnboardingPanel: Identifiable {
    let id: Int
    let title: String
    let subtitle: String
    let featureDescription: String
}

private let panels: [OnboardingPanel] = [
    OnboardingPanel(
        id: 0,
        title: "Welcome to Stikaro",
        subtitle: "Your creative photo editor",
        featureDescription: "Add text, stickers, watermarks and filters to any photo with a few taps."
    ),
    OnboardingPanel(
        id: 1,
        title: "Intuitive Gestures",
        subtitle: "Control everything with your fingers",
        featureDescription: "Pinch to scale, rotate with two fingers, and drag to reposition any element on your canvas."
    ),
    OnboardingPanel(
        id: 2,
        title: "Free Forever",
        subtitle: "No subscriptions. No hidden fees.",
        featureDescription: "Export your creations in full quality, anytime, absolutely free."
    )
]

// MARK: - OnboardingScreen

struct OnboardingScreen: View {
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var currentPage: Int = 0

    var body: some View {
        ZStack {
            // Background gradient
            AppGradients.backgroundOnboarding
                .ignoresSafeArea()

            // Decorative background shapes
            decorativeBackground

            VStack(spacing: 0) {
                TabView(selection: $currentPage) {
                    ForEach(panels) { panel in
                        OnboardingPanelView(panel: panel)
                            .tag(panel.id)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.35), value: currentPage)

                bottomControls
                    .padding(.bottom, Spacing.xxxl)
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Decorative Background

    private var decorativeBackground: some View {
        ZStack {
            // Large blurred circle — top right
            Circle()
                .fill(Color(hex: "#D4AF37").opacity(0.06))
                .frame(width: 350, height: 350)
                .blur(radius: 80)
                .offset(x: 120, y: -180)

            // Medium blurred circle — bottom left
            Circle()
                .fill(Color(hex: "#0A84FF").opacity(0.05))
                .frame(width: 250, height: 250)
                .blur(radius: 60)
                .offset(x: -100, y: 200)
        }
        .allowsHitTesting(false)
    }

    // MARK: - Bottom Controls

    private var bottomControls: some View {
        VStack(spacing: Spacing.l) {
            // Page dots
            HStack(spacing: Spacing.xs) {
                ForEach(0..<panels.count, id: \.self) { index in
                    Capsule()
                        .fill(index == currentPage ? Color(hex: "#D4AF37") : Color.white.opacity(0.3))
                        .frame(width: index == currentPage ? 24 : 8, height: 8)
                        .animation(.spring(response: 0.35, dampingFraction: 0.7), value: currentPage)
                }
            }

            // CTA button
            if currentPage == panels.count - 1 {
                Button {
                    appStore.setOnboardingSeen()
                    if appStore.preferences.hapticFeedback { HapticManager.shared.success() }
                } label: {
                    Text("Get Started")
                        .font(AppTypography.UI.button)
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .frame(height: Dims.Button.height)
                        .background(AppGradients.gold)
                        .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                        .goldGlowShadow()
                }
                .padding(.horizontal, Spacing.xl)
                .transition(.scale(scale: 0.9).combined(with: .opacity))
            } else {
                // Next button
                Button {
                    withAnimation(.easeInOut(duration: 0.35)) {
                        currentPage = min(currentPage + 1, panels.count - 1)
                    }
                    if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                } label: {
                    Text("Next")
                        .font(AppTypography.UI.button)
                        .foregroundStyle(Color(hex: "#D4AF37"))
                        .frame(maxWidth: .infinity)
                        .frame(height: Dims.Button.height)
                        .background(Color(hex: "#D4AF37").opacity(0.12))
                        .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                        .overlay(
                            RoundedRectangle(cornerRadius: Dims.Button.cornerRadius)
                                .strokeBorder(Color(hex: "#D4AF37").opacity(0.4), lineWidth: 1)
                        )
                }
                .padding(.horizontal, Spacing.xl)
            }

            // Skip (only on first two panels)
            if currentPage < panels.count - 1 {
                Button("Skip") {
                    appStore.setOnboardingSeen()
                }
                .font(AppTypography.Body.regular)
                .foregroundStyle(Color.white.opacity(0.4))
                .frame(height: Dims.minTapTarget)
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.75), value: currentPage)
    }
}

// MARK: - Onboarding Panel View

private struct OnboardingPanelView: View {
    let panel: OnboardingPanel

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Illustration
            illustration(for: panel.id)
                .frame(height: 280)
                .padding(.horizontal, Spacing.xl)

            Spacer(minLength: Spacing.xxl)

            // Text content
            VStack(spacing: Spacing.s) {
                Text(panel.title)
                    .font(AppTypography.Display.h2)
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)

                Text(panel.subtitle)
                    .font(AppTypography.Body.large)
                    .foregroundStyle(Color(hex: "#D4AF37"))
                    .multilineTextAlignment(.center)

                Text(panel.featureDescription)
                    .font(AppTypography.Body.regular)
                    .foregroundStyle(Color.white.opacity(0.65))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.l)
                    .padding(.top, Spacing.xxs)
            }
            .padding(.horizontal, Spacing.m)

            Spacer(minLength: Spacing.xxl)
        }
    }

    @ViewBuilder
    private func illustration(for id: Int) -> some View {
        switch id {
        case 0: PhotoEditingIllustration()
        case 1: GestureIllustration()
        case 2: ExportIllustration()
        default: EmptyView()
        }
    }
}

// MARK: - Photo Editing Illustration (Panel 1)

private struct PhotoEditingIllustration: View {
    @State private var floatOffset1: CGFloat = 0
    @State private var floatOffset2: CGFloat = 0
    @State private var floatOffset3: CGFloat = 0

    var body: some View {
        ZStack {
            // Main photo frame
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#1A1A2E"), Color(hex: "#16213E")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 180, height: 220)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color(hex: "#D4AF37").opacity(0.3), lineWidth: 1.5)
                )
                .shadowLevel2()

            // Gradient landscape inside frame
            RoundedRectangle(cornerRadius: 14)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#4A90D9"), Color(hex: "#87CEEB"), Color(hex: "#98D8B0")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 158, height: 140)
                .offset(y: -20)

            // Sun circle
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(hex: "#FFE066"), Color(hex: "#FFB700")],
                        center: .center,
                        startRadius: 0,
                        endRadius: 20
                    )
                )
                .frame(width: 32, height: 32)
                .offset(x: 40, y: -54)
                .shadow(color: Color(hex: "#FFB700").opacity(0.6), radius: 12)

            // Floating text sticker
            Text("AMAZING")
                .font(.system(size: 11, weight: .black))
                .foregroundStyle(Color(hex: "#D4AF37"))
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.black.opacity(0.7))
                .clipShape(Capsule())
                .offset(x: -20, y: 50)
                .rotationEffect(.degrees(-8))
                .offset(y: floatOffset1)
                .animation(
                    .easeInOut(duration: 3.2)
                    .repeatForever(autoreverses: true),
                    value: floatOffset1
                )

            // Floating star sticker
            Image(systemName: "star.fill")
                .font(.system(size: 22))
                .foregroundStyle(Color(hex: "#D4AF37"))
                .offset(x: 70, y: 30)
                .offset(y: floatOffset2)
                .animation(
                    .easeInOut(duration: 2.4)
                    .repeatForever(autoreverses: true),
                    value: floatOffset2
                )

            // Floating emoji sticker
            Text("✨")
                .font(.system(size: 28))
                .offset(x: -75, y: -10)
                .offset(y: floatOffset3)
                .animation(
                    .easeInOut(duration: 6.2)
                    .repeatForever(autoreverses: true),
                    value: floatOffset3
                )
        }
        .onAppear {
            floatOffset1 = -8
            floatOffset2 = -10
            floatOffset3 = -6
        }
    }
}

// MARK: - Gesture Illustration (Panel 2)

private struct GestureIllustration: View {
    @State private var scale: CGFloat = 1.0
    @State private var rotation: Double = 0
    @State private var fingerOffset: CGFloat = 0

    var body: some View {
        ZStack {
            // Canvas backdrop
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(hex: "#1A1A2E"))
                .frame(width: 200, height: 200)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color(hex: "#D4AF37").opacity(0.2), lineWidth: 1)
                )

            // The element being transformed
            RoundedRectangle(cornerRadius: 10)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#D4AF37"), Color(hex: "#C5A028")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 70, height: 70)
                .rotationEffect(.degrees(rotation))
                .scaleEffect(scale)
                .overlay(
                    Image(systemName: "star.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(.black.opacity(0.4))
                        .rotationEffect(.degrees(rotation))
                        .scaleEffect(scale)
                )

            // Finger indicator 1 (pinch)
            Circle()
                .fill(Color.white.opacity(0.8))
                .frame(width: 20, height: 20)
                .shadow(color: .white.opacity(0.4), radius: 6)
                .offset(x: -fingerOffset - 10, y: fingerOffset + 10)

            // Finger indicator 2 (pinch)
            Circle()
                .fill(Color.white.opacity(0.8))
                .frame(width: 20, height: 20)
                .shadow(color: .white.opacity(0.4), radius: 6)
                .offset(x: fingerOffset + 10, y: -fingerOffset - 10)

            // Dashed arc indicating rotation
            Circle()
                .stroke(
                    style: StrokeStyle(lineWidth: 1.5, dash: [4, 4])
                )
                .foregroundStyle(Color(hex: "#D4AF37").opacity(0.5))
                .frame(width: 110, height: 110)
        }
        .onAppear {
            withAnimation(
                .easeInOut(duration: 2.4)
                .repeatForever(autoreverses: true)
            ) {
                scale = 1.35
                rotation = 25
                fingerOffset = 14
            }
        }
    }
}

// MARK: - Export Illustration (Panel 3)

private struct ExportIllustration: View {
    @State private var arrowOffset: CGFloat = 0
    @State private var glowOpacity: Double = 0.4
    @State private var checkmarkScale: CGFloat = 0.8

    var body: some View {
        ZStack {
            // Background glow
            Circle()
                .fill(Color(hex: "#D4AF37").opacity(glowOpacity))
                .frame(width: 180, height: 180)
                .blur(radius: 50)
                .animation(
                    .easeInOut(duration: 3.2)
                    .repeatForever(autoreverses: true),
                    value: glowOpacity
                )

            // Outer ring
            Circle()
                .stroke(
                    AngularGradient(
                        colors: [Color(hex: "#D4AF37"), Color(hex: "#D4AF37").opacity(0.1), Color(hex: "#D4AF37")],
                        center: .center
                    ),
                    lineWidth: 2
                )
                .frame(width: 140, height: 140)

            // Main circle
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#2A2A2E"), Color(hex: "#1A1A1D")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 120, height: 120)
                .overlay(
                    Circle()
                        .strokeBorder(Color(hex: "#D4AF37").opacity(0.4), lineWidth: 1.5)
                )

            // Upload arrow
            VStack(spacing: 2) {
                Image(systemName: "arrow.up")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(Color(hex: "#D4AF37"))

                Text("FREE")
                    .font(.system(size: 10, weight: .black))
                    .foregroundStyle(Color(hex: "#D4AF37").opacity(0.7))
                    .kerning(2)
            }
            .offset(y: arrowOffset)
            .animation(
                .easeInOut(duration: 6.2)
                .repeatForever(autoreverses: true),
                value: arrowOffset
            )

            // Format badges
            HStack(spacing: 0) {
                // PNG badge
                Text("PNG")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(hex: "#0A84FF"))
                    .clipShape(Capsule())
                    .offset(x: -80, y: 55)

                // JPG badge
                Text("JPG")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(hex: "#FF9500"))
                    .clipShape(Capsule())
                    .offset(x: 50, y: 55)
            }

            // Floating checkmark
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 28))
                .foregroundStyle(Color(hex: "#34C759"))
                .offset(x: 65, y: -50)
                .scaleEffect(checkmarkScale)
                .animation(
                    .easeInOut(duration: 2.4)
                    .repeatForever(autoreverses: true),
                    value: checkmarkScale
                )
        }
        .onAppear {
            arrowOffset = -6
            glowOpacity = 0.7
            checkmarkScale = 1.1
        }
    }
}
