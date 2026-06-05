import SwiftUI

// MARK: - Editor Tool

enum EditorTool: Int, CaseIterable {
    case watermark = 0
    case text
    case sticker
    case stamps
    case filter
    case layers

    var icon: String {
        switch self {
        case .watermark: return "signature"
        case .text:      return "textformat"
        case .sticker:   return "face.smiling"
        case .stamps:    return "seal"
        case .filter:    return "wand.and.stars"
        case .layers:    return "square.3.layers.3d"
        }
    }

    var label: String {
        switch self {
        case .watermark: return "Watermark"
        case .text:      return "Text"
        case .sticker:   return "Sticker"
        case .stamps:    return "Stamps"
        case .filter:    return "Filter"
        case .layers:    return "Layers"
        }
    }
}

// MARK: - EditorScreen

struct EditorScreen: View {
    let projectId: String?
    let imageUri: String?
    let imageDimensions: CGSize?
    let navigationState: NavigationState

    @Environment(AppStore.self) private var appStore
    @Environment(EditorStore.self) private var editorStore
    @Environment(\.dismiss) private var dismiss

    private var theme: Theme {
        AppThemes.theme(for: appStore.preferences.theme)
    }

    // Tool state
    @State private var activeTool: EditorTool? = nil
    @State private var toolIndicatorOffset: CGFloat = 0
    @State private var showToolSheet: Bool = false

    // Text editing
    @State private var editingTextElementId: String? = nil
    @State private var editingTextContent: String = ""
    @State private var showTextModal: Bool = false

    // Export
    @State private var showExportSheet: Bool = false

    // Canvas size computed from geometry
    @State private var canvasContainerSize: CGSize = .zero

    var body: some View {
        GeometryReader { geo in
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                VStack(spacing: 0) {
                    topBar
                    canvasArea(screenSize: geo.size)
                    Spacer(minLength: 0)
                    bottomToolbar(screenWidth: geo.size.width)
                }
            }
        }
        .navigationBarHidden(true)
        .task {
            await initializeEditor()
        }
        .onDisappear {
            if appStore.preferences.autoSaveProjects && editorStore.hasChanges() {
                Task {
                    await editorStore.saveProject(canvasSize: canvasContainerSize == .zero ? nil : canvasContainerSize)
                }
            }
        }
        .sheet(isPresented: $showToolSheet) {
            if let tool = activeTool {
                toolModalContent(for: tool)
            }
        }
        .sheet(isPresented: $showTextModal) {
            TextToolModal(
                elementId: editingTextElementId,
                initialText: editingTextContent,
                theme: theme
            )
            .environment(editorStore)
            .environment(appStore)
        }
        .sheet(isPresented: $showExportSheet) {
            ExportSheet(theme: theme)
                .environment(editorStore)
                .environment(appStore)
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack(spacing: Spacing.xs) {
            // Back button — default navigation back style
            Button {
                if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                dismiss()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 17, weight: .semibold))
                    Text("Back")
                        .font(.system(size: 17, weight: .regular))
                }
                .foregroundStyle(theme.accent.secondary)
                .frame(minWidth: Dims.minTapTarget, minHeight: Dims.minTapTarget, alignment: .leading)
            }

            Spacer()

            // Undo
            Button {
                if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                editorStore.undo()
            } label: {
                Image(systemName: "arrow.uturn.backward")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(editorStore.canUndo ? theme.text.primary : theme.text.subtle)
                    .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
            }
            .disabled(!editorStore.canUndo)

            // Redo
            Button {
                if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                editorStore.redo()
            } label: {
                Image(systemName: "arrow.uturn.forward")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(editorStore.canRedo ? theme.text.primary : theme.text.subtle)
                    .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
            }
            .disabled(!editorStore.canRedo)

            // Export
            Button {
                if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
                showExportSheet = true
            } label: {
                Text("Export")
                    .font(AppTypography.UI.label)
                    .foregroundStyle(.black)
                    .padding(.horizontal, Spacing.s)
                    .padding(.vertical, 8)
                    .background(AppGradients.gold)
                    .clipShape(Capsule())
                    .frame(minHeight: Dims.minTapTarget)
            }
        }
        .padding(.horizontal, Spacing.m)
        .frame(height: Dims.topBar)
        .background(theme.backgrounds.primary)
    }

    // MARK: - Canvas Area

    @ViewBuilder
    private func canvasArea(screenSize: CGSize) -> some View {
        let availableHeight = screenSize.height - Dims.topBar - Dims.toolbar
        let canvasDimensions = computeCanvasSize(available: CGSize(width: screenSize.width, height: availableHeight))

        ZStack {
            theme.backgrounds.secondary.ignoresSafeArea(edges: .horizontal)

            if let imagePath = editorStore.sourceImagePath {
                CanvasView(
                    sourceImageUri: imagePath,
                    canvasWidth: canvasDimensions.width,
                    canvasHeight: canvasDimensions.height,
                    onTextEdit: { elementId, currentText in
                        editingTextElementId = elementId
                        editingTextContent = currentText
                        showTextModal = true
                    },
                    onCanvasBackgroundTap: {
                        activeTool = nil
                    }
                )
                .shadow(color: .black.opacity(0.3), radius: 16, x: 0, y: 4)
            } else {
                RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                    .fill(theme.backgrounds.tertiary)
                    .frame(width: canvasDimensions.width, height: canvasDimensions.height)
                    .overlay(
                        ProgressView()
                            .tint(theme.accent.primary)
                    )
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: availableHeight)
        .onAppear {
            canvasContainerSize = canvasDimensions
        }
        .onChange(of: editorStore.sourceImageDimensions) { _, _ in
            canvasContainerSize = computeCanvasSize(available: CGSize(width: screenSize.width, height: availableHeight))
        }
    }

    private func computeCanvasSize(available: CGSize) -> CGSize {
        guard let dims = editorStore.sourceImageDimensions ?? imageDimensions,
              dims.width > 0 && dims.height > 0 else {
            return CGSize(width: available.width - Spacing.l, height: available.height - Spacing.l)
        }

        let padding: CGFloat = Spacing.l
        let maxW = available.width - padding
        let maxH = available.height - padding
        let aspectRatio = dims.width / dims.height

        if maxW / aspectRatio <= maxH {
            return CGSize(width: maxW, height: maxW / aspectRatio)
        } else {
            return CGSize(width: maxH * aspectRatio, height: maxH)
        }
    }

    // MARK: - Bottom Toolbar

    private func bottomToolbar(screenWidth: CGFloat) -> some View {
        let toolWidth = screenWidth / CGFloat(EditorTool.allCases.count)

        return ZStack(alignment: .bottom) {
            // Active gold underline indicator
            if let active = activeTool {
                Rectangle()
                    .fill(AppGradients.gold)
                    .frame(width: toolWidth * 0.5, height: 2.5)
                    .clipShape(Capsule())
                    .offset(x: toolWidth * CGFloat(active.rawValue) + toolWidth * 0.25 - screenWidth / 2)
                    .animation(.spring(response: 0.3, dampingFraction: 0.75), value: active)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Tool buttons
            HStack(spacing: 0) {
                ForEach(EditorTool.allCases, id: \.rawValue) { tool in
                    Button {
                        selectTool(tool)
                    } label: {
                        VStack(spacing: 3) {
                            Image(systemName: tool.icon)
                                .font(.system(size: 20, weight: activeTool == tool ? .semibold : .regular))
                                .foregroundStyle(activeTool == tool ? theme.accent.primary : theme.text.secondary)

                            Text(tool.label)
                                .font(AppTypography.Body.finePrint)
                                .foregroundStyle(activeTool == tool ? theme.accent.primary : theme.text.tertiary)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: Dims.toolbar)
                        .contentShape(Rectangle())
                    }
                    .animation(.spring(response: 0.25, dampingFraction: 0.8), value: activeTool)
                }
            }
        }
        .background(theme.backgrounds.secondary)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(theme.backgrounds.tertiary)
                .frame(height: 0.5)
        }
    }

    // MARK: - Tool Selection

    private func selectTool(_ tool: EditorTool) {
        if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }

        if activeTool == tool {
            // Toggle off or re-open sheet
            showToolSheet = true
        } else {
            activeTool = tool
            // Text tool opens inline text modal
            if tool == .text {
                editingTextElementId = nil
                editingTextContent = ""
                showTextModal = true
            } else {
                showToolSheet = true
            }
        }
    }

    // MARK: - Tool Modal Content

    @ViewBuilder
    private func toolModalContent(for tool: EditorTool) -> some View {
        switch tool {
        case .watermark:
            WatermarkToolModal(theme: theme)
                .environment(editorStore)
                .environment(appStore)
        case .text:
            TextToolModal(elementId: nil, initialText: "", theme: theme)
                .environment(editorStore)
                .environment(appStore)
        case .sticker:
            StickerToolModal(theme: theme)
                .environment(editorStore)
                .environment(appStore)
        case .stamps:
            StampsToolModal(theme: theme)
                .environment(editorStore)
                .environment(appStore)
        case .filter:
            FilterToolModal(theme: theme)
                .environment(editorStore)
                .environment(appStore)
        case .layers:
            LayersToolModal(theme: theme)
                .environment(editorStore)
                .environment(appStore)
        }
    }

    // MARK: - Initialization

    private func initializeEditor() async {
        if let projectId = projectId {
            await editorStore.loadProject(projectId)
        } else if let uri = imageUri, let dims = imageDimensions {
            editorStore.initializeProject(imageUri: uri, dimensions: dims)
        } else if let uri = imageUri {
            // Try to load image to get actual dimensions
            let dims = await loadImageDimensions(from: uri)
            editorStore.initializeProject(imageUri: uri, dimensions: dims)
        }
    }

    private func loadImageDimensions(from uri: String) async -> CGSize {
        return await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let path = uri.replacingOccurrences(of: "file://", with: "")
                if let image = UIImage(contentsOfFile: path) {
                    continuation.resume(returning: image.size)
                } else {
                    continuation.resume(returning: CGSize(width: 1080, height: 1080))
                }
            }
        }
    }
}

// MARK: - Tool Modal Shells
// These are stub containers that display a drag-handle header and dismiss on swipe.
// Each tool modal should be fleshed out in its own file.

private struct ToolModalShell<Content: View>: View {
    let title: String
    let theme: Theme
    @ViewBuilder let content: () -> Content
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()
                content()
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
}

// MARK: Watermark Tool Modal

struct WatermarkToolModal: View {
    let theme: Theme
    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var selectedPresetId: String?
    @State private var customText: String = "Stikaro"
    @State private var globalOpacity: Double = 30
    @State private var globalScale: Double = 100
    @State private var globalRotation: Double = 0

    private let presets = WatermarkPresets.all
    private let gridColumns = [GridItem(.flexible(), spacing: Spacing.s), GridItem(.flexible(), spacing: Spacing.s)]

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: Spacing.l) {
                        // Custom text input
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("Text")
                                .font(AppTypography.UI.label)
                                .foregroundStyle(theme.text.secondary)

                            TextField("Watermark text", text: $customText)
                                .font(AppTypography.UI.input)
                                .foregroundStyle(theme.text.primary)
                                .padding(Spacing.m)
                                .background(theme.backgrounds.secondary)
                                .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.medium))
                        }

                        Divider().overlay(theme.backgrounds.tertiary)

                        // Preset grid
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("Presets")
                                .font(AppTypography.UI.label)
                                .foregroundStyle(theme.text.secondary)

                            LazyVGrid(columns: gridColumns, spacing: Spacing.s) {
                                ForEach(presets) { preset in
                                    presetCell(preset)
                                }
                            }
                        }

                        Divider().overlay(theme.backgrounds.tertiary)

                        // Adjustment sliders
                        VStack(spacing: Spacing.m) {
                            sliderRow(title: "Opacity", value: $globalOpacity, range: 5...100, unit: "%")
                            sliderRow(title: "Scale", value: $globalScale, range: 20...200, unit: "%")
                            sliderRow(title: "Rotation", value: $globalRotation, range: -180...180, unit: "°")
                        }

                        // Apply button
                        Button {
                            applyWatermark()
                        } label: {
                            Text("Apply Watermark")
                                .font(AppTypography.UI.button)
                                .foregroundStyle(Color(hex: "#0F0F12"))
                                .frame(maxWidth: .infinity)
                                .frame(height: Dims.Button.height)
                                .background(AppGradients.gold)
                                .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                        }
                        .disabled(customText.isEmpty || selectedPresetId == nil)
                        .opacity(customText.isEmpty || selectedPresetId == nil ? 0.5 : 1)
                    }
                    .padding(.horizontal, Spacing.l)
                    .padding(.top, Spacing.l)
                    .padding(.bottom, Spacing.xxl)
                }
            }
            .navigationTitle("Watermark")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Preset Cell

    private func presetCell(_ preset: WatermarkPreset) -> some View {
        let isSelected = selectedPresetId == preset.id
        return Button {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                selectedPresetId = preset.id
            }
            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
        } label: {
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                // Pattern icon
                ZStack {
                    RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                        .fill(theme.backgrounds.secondary)
                        .frame(height: 64)
                        .overlay(
                            RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                                .strokeBorder(
                                    isSelected ? theme.accent.primary : theme.backgrounds.tertiary,
                                    lineWidth: isSelected ? 2 : 1
                                )
                        )

                    patternIcon(preset.pattern)
                        .font(.system(size: 20))
                        .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                }

                Text(preset.name)
                    .font(AppTypography.Body.caption)
                    .foregroundStyle(isSelected ? theme.accent.primary : theme.text.primary)
                    .lineLimit(1)

                Text(preset.description)
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(theme.text.subtle)
                    .lineLimit(1)
            }
        }
    }

    private func patternIcon(_ pattern: WatermarkPattern) -> some View {
        Group {
            switch pattern {
            case .grid:      Image(systemName: "square.grid.3x3")
            case .diagonal:  Image(systemName: "line.diagonal")
            case .scattered: Image(systemName: "sparkles")
            case .corners:   Image(systemName: "arrow.up.left.and.arrow.down.right")
            case .edges:     Image(systemName: "rectangle")
            case .center:    Image(systemName: "circle")
            case .single:    Image(systemName: "text.cursor")
            }
        }
    }

    // MARK: - Slider Row

    private func sliderRow(title: String, value: Binding<Double>, range: ClosedRange<Double>, unit: String) -> some View {
        VStack(spacing: Spacing.xxs) {
            HStack {
                Text(title)
                    .font(AppTypography.UI.label)
                    .foregroundStyle(theme.text.secondary)
                Spacer()
                Text("\(Int(value.wrappedValue))\(unit)")
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundStyle(theme.accent.primary)
                    .frame(width: 52, alignment: .trailing)
            }
            Slider(value: value, in: range, step: 1)
                .tint(theme.accent.primary)
        }
    }

    // MARK: - Apply

    private func applyWatermark() {
        guard let presetId = selectedPresetId,
              let preset = presets.first(where: { $0.id == presetId }),
              !customText.isEmpty else { return }

        let canvasSize = editorStore.canvasSize ?? editorStore.sourceImageDimensions ?? CGSize(width: 1080, height: 1080)

        // Generate watermark instances from preset
        var instances = WatermarkManager.applyPreset(preset, canvasSize: canvasSize, content: customText, type: .text)

        // Apply global settings
        let settings = WatermarkGlobalSettings(
            opacity: globalOpacity / 100,
            scale: globalScale / 100,
            rotation: globalRotation
        )
        instances = WatermarkManager.applyGlobalSettings(to: instances, settings: settings)

        // Convert to canvas elements and add
        let elements = WatermarkManager.toCanvasElements(instances, canvasSize: canvasSize)
        if !elements.isEmpty {
            editorStore.addElements(elements)
            if appStore.preferences.hapticFeedback { HapticManager.shared.success() }
            dismiss()
        }
    }
}

// MARK: Text Tool Modal

struct TextToolModal: View {
    let elementId: String?
    let initialText: String
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var text: String = ""
    @State private var selectedFont: String = ".SFUI-Regular"
    @State private var fontSize: CGFloat = 32
    @State private var textColor: Color = .white

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                VStack(spacing: Spacing.m) {
                    // Text preview
                    ZStack {
                        RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                            .fill(theme.backgrounds.secondary)
                            .frame(height: 120)

                        if text.isEmpty {
                            Text("Type something…")
                                .font(.custom(selectedFont, size: fontSize))
                                .foregroundStyle(theme.text.subtle)
                        } else {
                            Text(text)
                                .font(.custom(selectedFont, size: fontSize))
                                .foregroundStyle(textColor)
                                .multilineTextAlignment(.center)
                                .padding(Spacing.s)
                        }
                    }
                    .padding(.horizontal, Spacing.m)

                    // Text input
                    TextField("Enter text", text: $text)
                        .font(AppTypography.UI.input)
                        .foregroundStyle(theme.text.primary)
                        .padding(Spacing.m)
                        .background(theme.backgrounds.secondary)
                        .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.medium))
                        .padding(.horizontal, Spacing.m)

                    // Font size
                    HStack {
                        Text("Size")
                            .font(AppTypography.UI.label)
                            .foregroundStyle(theme.text.secondary)
                        Slider(value: $fontSize, in: 12...120)
                            .tint(theme.accent.primary)
                        Text("\(Int(fontSize))")
                            .font(AppTypography.Body.caption)
                            .foregroundStyle(theme.text.secondary)
                            .frame(width: 32)
                    }
                    .padding(.horizontal, Spacing.m)

                    // Color picker row
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            ForEach(textPresetColors, id: \.self) { color in
                                Circle()
                                    .fill(color)
                                    .frame(width: 32, height: 32)
                                    .overlay(
                                        Circle()
                                            .strokeBorder(
                                                textColor == color ? theme.accent.primary : Color.clear,
                                                lineWidth: 2.5
                                            )
                                    )
                                    .onTapGesture { textColor = color }
                            }
                        }
                        .padding(.horizontal, Spacing.m)
                    }

                    Spacer()
                }
                .padding(.top, Spacing.m)
            }
            .navigationTitle(elementId == nil ? "Add Text" : "Edit Text")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(theme.text.secondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Add") {
                        commitText()
                        dismiss()
                    }
                    .font(AppTypography.UI.label)
                    .foregroundStyle(theme.accent.primary)
                    .disabled(text.isEmpty)
                }
            }
        }
        .onAppear {
            text = initialText
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    private var textPresetColors: [Color] {
        [.white, .black, Color(hex: "#D4AF37"), Color(hex: "#FF3B30"),
         Color(hex: "#34C759"), Color(hex: "#0A84FF"), Color(hex: "#FF9500"),
         Color(hex: "#AF52DE"), Color(hex: "#FF2D55")]
    }

    private func commitText() {
        guard !text.isEmpty else { return }
        let hexColor = UIColor(textColor).toHexString()

        if let id = elementId {
            editorStore.updateElement(id: id) { el in
                el.textContent = text
                el.fontSize = fontSize
                el.color = hexColor
                el.fontFamily = selectedFont
            }
        } else {
            let newElement = CanvasElement(
                type: .text,
                position: CGPoint(
                    x: (editorStore.canvasSize?.width ?? 500) / 2,
                    y: (editorStore.canvasSize?.height ?? 500) / 2
                ),
                scale: 1.0,
                rotation: 0,
                opacity: 1.0,
                textContent: text,
                fontFamily: selectedFont,
                fontSize: fontSize,
                color: hexColor
            )
            editorStore.addElement(newElement)
        }
        if appStore.preferences.hapticFeedback { HapticManager.shared.success() }
    }
}

// MARK: Sticker Tool Modal

struct StickerToolModal: View {
    let theme: Theme
    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore

    var body: some View {
        ToolModalShell(title: "Stickers", theme: theme) {
            Text("Sticker library coming soon")
                .foregroundStyle(theme.text.secondary)
        }
    }
}

// MARK: Stamps Tool Modal

struct StampsToolModal: View {
    let theme: Theme
    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore

    var body: some View {
        ToolModalShell(title: "Stamps", theme: theme) {
            Text("Stamp library coming soon")
                .foregroundStyle(theme.text.secondary)
        }
    }
}

// MARK: Filter Tool Modal

struct FilterToolModal: View {
    let theme: Theme
    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    private let filters: [ImageFilter] = FilterType.allCases.map {
        ImageFilter(name: $0.rawValue.capitalized, type: $0)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 88), spacing: Spacing.xs)], spacing: Spacing.xs) {
                        ForEach(filters) { filter in
                            FilterCell(
                                filter: filter,
                                isActive: editorStore.appliedFilter?.type == filter.type,
                                theme: theme
                            ) {
                                if filter.type == .none {
                                    editorStore.removeFilter()
                                } else {
                                    editorStore.applyFilter(filter)
                                }
                                if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                            }
                        }
                    }
                    .padding(Spacing.m)
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
}

private struct FilterCell: View {
    let filter: ImageFilter
    let isActive: Bool
    let theme: Theme
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: Spacing.xxs) {
                RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                    .fill(theme.backgrounds.tertiary)
                    .frame(width: 80, height: 80)
                    .overlay(
                        RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                            .strokeBorder(
                                isActive ? theme.accent.primary : Color.clear,
                                lineWidth: 2
                            )
                    )
                    .overlay(
                        Text(filter.type == .none ? "✕" : "")
                            .font(.system(size: 20))
                    )

                Text(filter.name)
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(isActive ? theme.accent.primary : theme.text.secondary)
                    .lineLimit(1)
            }
        }
    }
}

// MARK: Layers Tool Modal

struct LayersToolModal: View {
    let theme: Theme
    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                if editorStore.canvasElements.isEmpty {
                    Text("No layers yet")
                        .font(AppTypography.Body.regular)
                        .foregroundStyle(theme.text.secondary)
                } else {
                    List {
                        ForEach(editorStore.canvasElements.reversed()) { element in
                            LayerRow(element: element, theme: theme) {
                                editorStore.selectElement(element.id)
                                dismiss()
                            } onDelete: {
                                if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
                                editorStore.deleteElement(id: element.id)
                            } onMoveUp: {
                                editorStore.moveElementUp(id: element.id)
                            } onMoveDown: {
                                editorStore.moveElementDown(id: element.id)
                            }
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    .background(theme.backgrounds.primary)
                }
            }
            .navigationTitle("Layers")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
}

private struct LayerRow: View {
    let element: CanvasElement
    let theme: Theme
    let onSelect: () -> Void
    let onDelete: () -> Void
    let onMoveUp: () -> Void
    let onMoveDown: () -> Void

    var body: some View {
        HStack(spacing: Spacing.s) {
            // Type icon
            Image(systemName: element.type == .text ? "textformat" : "photo")
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(theme.text.secondary)
                .frame(width: 32, height: 32)
                .background(theme.backgrounds.secondary)
                .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.small))

            // Label
            VStack(alignment: .leading, spacing: 2) {
                Text(element.type.rawValue.capitalized)
                    .font(AppTypography.UI.label)
                    .foregroundStyle(theme.text.primary)
                if let text = element.textContent {
                    Text(text)
                        .font(AppTypography.Body.caption)
                        .foregroundStyle(theme.text.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Move buttons
            HStack(spacing: Spacing.xxs) {
                Button(action: onMoveUp) {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(theme.text.secondary)
                        .frame(width: 32, height: 32)
                }

                Button(action: onMoveDown) {
                    Image(systemName: "arrow.down")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(theme.text.secondary)
                        .frame(width: 32, height: 32)
                }

                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(theme.semantic.error)
                        .frame(width: 32, height: 32)
                }
            }
        }
        .padding(.vertical, Spacing.xxs)
        .listRowBackground(theme.backgrounds.primary)
        .contentShape(Rectangle())
        .onTapGesture(perform: onSelect)
    }
}

// MARK: Export Sheet

struct ExportSheet: View {
    let theme: Theme
    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var exportFormat: ExportFormat = .png
    @State private var exportQuality: Double = 100
    @State private var isExporting: Bool = false
    @State private var exportSuccess: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                VStack(spacing: Spacing.l) {
                    // Format picker
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("Format")
                            .font(AppTypography.UI.label)
                            .foregroundStyle(theme.text.secondary)

                        HStack(spacing: Spacing.xs) {
                            ForEach([ExportFormat.png, ExportFormat.jpg], id: \.self) { format in
                                Button {
                                    exportFormat = format
                                } label: {
                                    Text(format.rawValue.uppercased())
                                        .font(AppTypography.UI.label)
                                        .foregroundStyle(exportFormat == format ? .black : theme.text.primary)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 44)
                                        .background(
                                            exportFormat == format
                                                ? AppGradients.gold
                                                : LinearGradient(colors: [theme.backgrounds.secondary], startPoint: .top, endPoint: .bottom)
                                        )
                                        .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.medium))
                                }
                            }
                        }
                    }

                    // Quality slider (JPG only)
                    if exportFormat == .jpg {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack {
                                Text("Quality")
                                    .font(AppTypography.UI.label)
                                    .foregroundStyle(theme.text.secondary)
                                Spacer()
                                Text("\(Int(exportQuality))%")
                                    .font(AppTypography.Body.caption)
                                    .foregroundStyle(theme.text.secondary)
                            }
                            Slider(value: $exportQuality, in: 10...100, step: 5)
                                .tint(theme.accent.primary)
                        }
                    }

                    // Export button
                    Button {
                        performExport()
                    } label: {
                        Group {
                            if isExporting {
                                ProgressView()
                                    .tint(.black)
                            } else if exportSuccess {
                                Label("Saved to Photos", systemImage: "checkmark.circle.fill")
                                    .font(AppTypography.UI.button)
                                    .foregroundStyle(.black)
                            } else {
                                Text("Export to Camera Roll")
                                    .font(AppTypography.UI.button)
                                    .foregroundStyle(.black)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: Dims.Button.height)
                        .background(AppGradients.gold)
                        .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                    }
                    .disabled(isExporting || exportSuccess)

                    Spacer()
                }
                .padding(Spacing.l)
            }
            .navigationTitle("Export")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .onAppear {
            exportFormat = appStore.preferences.defaultExportFormat
            exportQuality = Double(appStore.preferences.defaultExportQuality)
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    private func performExport() {
        guard let sourceImagePath = editorStore.sourceImagePath,
              let sourceImageDimensions = editorStore.sourceImageDimensions else { return }

        isExporting = true
        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }

        DispatchQueue.global(qos: .userInitiated).async {
            let image = ImageExporter.render(
                sourceImagePath: sourceImagePath,
                sourceImageDimensions: sourceImageDimensions,
                canvasElements: editorStore.canvasElements,
                canvasSize: editorStore.canvasSize,
                format: exportFormat,
                quality: Int(exportQuality),
                filter: editorStore.appliedFilter
            )

            DispatchQueue.main.async {
                guard let image else {
                    isExporting = false
                    return
                }

                UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
                isExporting = false
                exportSuccess = true
                if appStore.preferences.hapticFeedback { HapticManager.shared.success() }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    dismiss()
                }
            }
        }
    }
}

// MARK: - UIColor Hex Helper

private extension UIColor {
    func toHexString() -> String {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        getRed(&r, green: &g, blue: &b, alpha: &a)
        return String(format: "#%02X%02X%02X", Int(r * 255), Int(g * 255), Int(b * 255))
    }
}
