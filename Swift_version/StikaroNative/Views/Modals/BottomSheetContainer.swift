import SwiftUI

// MARK: - BottomSheetContainer

/// Custom bottom sheet container for pixel-accurate presentation.
/// Uses a spring animation and supports pan-to-dismiss.
struct BottomSheetContainer<Content: View>: View {
    @Binding var isPresented: Bool
    @ViewBuilder let content: () -> Content

    // Pan gesture state
    @State private var dragOffset: CGFloat = 0
    @State private var isDragging: Bool = false

    private let cornerRadius: CGFloat = Dims.CornerRadius.xlarge   // 24pt
    private let dismissThreshold: CGFloat = 100
    private let dismissVelocity: CGFloat = 500
    private let springResponse: Double = 0.35
    private let dampingFraction: Double = 0.72

    var body: some View {
        ZStack(alignment: .bottom) {
            // Backdrop
            if isPresented {
                Color.black
                    .opacity(0.55)
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture {
                        dismiss()
                    }
            }

            // Sheet
            if isPresented {
                sheetContent
                    .transition(
                        .asymmetric(
                            insertion: .move(edge: .bottom).combined(with: .opacity),
                            removal:   .move(edge: .bottom).combined(with: .opacity)
                        )
                    )
            }
        }
        .animation(
            .spring(response: springResponse, dampingFraction: dampingFraction),
            value: isPresented
        )
        .ignoresSafeArea()
    }

    // MARK: - Sheet Content

    private var sheetContent: some View {
        VStack(spacing: 0) {
            dragHandle
            content()
        }
        .background(
            RoundedRectangle(cornerRadius: cornerRadius)
                .fill(Color(hex: "#1A1A1D"))
                .ignoresSafeArea(edges: .bottom)
        )
        .clipShape(
            RoundedCornerShape(radius: cornerRadius, corners: [.topLeft, .topRight])
        )
        .offset(y: max(0, dragOffset))
        .gesture(panGesture)
    }

    // MARK: - Drag Handle

    private var dragHandle: some View {
        RoundedRectangle(cornerRadius: 2.5)
            .fill(Color.white.opacity(0.3))
            .frame(width: 40, height: 5)
            .padding(.top, Spacing.s)
            .padding(.bottom, Spacing.xs)
    }

    // MARK: - Pan Gesture

    private var panGesture: some Gesture {
        DragGesture(minimumDistance: 8)
            .onChanged { value in
                isDragging = true
                dragOffset = value.translation.height
            }
            .onEnded { value in
                isDragging = false
                let velocity = value.predictedEndTranslation.height - value.translation.height
                if dragOffset > dismissThreshold || velocity > dismissVelocity {
                    dismiss()
                } else {
                    withAnimation(.spring(response: springResponse, dampingFraction: dampingFraction)) {
                        dragOffset = 0
                    }
                }
            }
    }

    // MARK: - Dismiss

    private func dismiss() {
        withAnimation(.spring(response: springResponse, dampingFraction: dampingFraction)) {
            isPresented = false
            dragOffset = 0
        }
    }
}

// MARK: - RoundedCornerShape

/// UIRectCorner-based shape that rounds only the specified corners.
private struct RoundedCornerShape: Shape {
    var radius: CGFloat
    var corners: UIRectCorner

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

// MARK: - View extension for convenience

extension View {
    /// Presents a custom BottomSheetContainer overlay over the current view.
    func bottomSheet<Content: View>(
        isPresented: Binding<Bool>,
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        self.overlay(alignment: .bottom) {
            BottomSheetContainer(isPresented: isPresented, content: content)
        }
    }
}
