import Foundation
import CoreImage

// 5x4 color matrix (20 floats: 4 rows of [R, G, B, A, Offset])
typealias ColorMatrix = [CGFloat]

private let IDENTITY_MATRIX: ColorMatrix = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
]

private func clamp(_ value: CGFloat, _ lo: CGFloat, _ hi: CGFloat) -> CGFloat {
    min(max(value, lo), hi)
}

// MARK: - 5x5 matrix helpers

private func to5x5(_ m: ColorMatrix) -> [[CGFloat]] {
    [
        [m[0], m[1], m[2], m[3], m[4]],
        [m[5], m[6], m[7], m[8], m[9]],
        [m[10], m[11], m[12], m[13], m[14]],
        [m[15], m[16], m[17], m[18], m[19]],
        [0, 0, 0, 0, 1],
    ]
}

private func from5x5(_ m: [[CGFloat]]) -> ColorMatrix {
    var result = ColorMatrix(repeating: 0, count: 20)
    for row in 0..<4 {
        for col in 0..<5 {
            result[row * 5 + col] = m[row][col]
        }
    }
    return result
}

private func multiplyMatrices(_ a: ColorMatrix, _ b: ColorMatrix) -> ColorMatrix {
    let A = to5x5(a)
    let B = to5x5(b)
    var result = Array(repeating: Array(repeating: CGFloat(0), count: 5), count: 5)
    for row in 0..<5 {
        for col in 0..<5 {
            var sum: CGFloat = 0
            for k in 0..<5 { sum += A[row][k] * B[k][col] }
            result[row][col] = sum
        }
    }
    return from5x5(result)
}

private func composeMatrices(_ matrices: ColorMatrix...) -> ColorMatrix {
    guard !matrices.isEmpty else { return IDENTITY_MATRIX }
    return matrices.reduce(IDENTITY_MATRIX) { acc, m in multiplyMatrices(m, acc) }
}

// MARK: - Luma constants

private let LUMA_R: CGFloat = 0.299
private let LUMA_G: CGFloat = 0.587
private let LUMA_B: CGFloat = 0.114

// MARK: - Matrix generators

private func saturationMatrix(_ value: CGFloat) -> ColorMatrix {
    let s = clamp(value, 0, 3)
    let inv = 1 - s
    let r = inv * LUMA_R, g = inv * LUMA_G, b = inv * LUMA_B
    return [
        r + s, g,     b,     0, 0,
        r,     g + s, b,     0, 0,
        r,     g,     b + s, 0, 0,
        0,     0,     0,     1, 0,
    ]
}

private func contrastMatrix(_ value: CGFloat) -> ColorMatrix {
    let c = clamp(value, 0, 4)
    let t = 0.5 * (1 - c)
    return [
        c, 0, 0, 0, t,
        0, c, 0, 0, t,
        0, 0, c, 0, t,
        0, 0, 0, 1, 0,
    ]
}

private func brightnessMatrix(_ value: CGFloat) -> ColorMatrix {
    let offset = clamp(value, -1, 1)
    return [
        1, 0, 0, 0, offset,
        0, 1, 0, 0, offset,
        0, 0, 1, 0, offset,
        0, 0, 0, 1, 0,
    ]
}

private func rgbScaleMatrix(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat) -> ColorMatrix {
    let r = clamp(red, 0, 4), g = clamp(green, 0, 4), b = clamp(blue, 0, 4)
    return [
        r, 0, 0, 0, 0,
        0, g, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0,
    ]
}

private func channelOffsetMatrix(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat) -> ColorMatrix {
    let r = clamp(red, -1, 1), g = clamp(green, -1, 1), b = clamp(blue, -1, 1)
    return [
        1, 0, 0, 0, r,
        0, 1, 0, 0, g,
        0, 0, 1, 0, b,
        0, 0, 0, 1, 0,
    ]
}

private func mixMatrices(_ from: ColorMatrix, _ to: ColorMatrix, amount: CGFloat) -> ColorMatrix {
    zip(from, to).map { s, e in s + (e - s) * amount }
}

// MARK: - Base filter matrices

private let BASE_FILTER_MATRICES: [FilterType: ColorMatrix] = {
    var m = [FilterType: ColorMatrix]()

    // Core filters
    m[.bw] = composeMatrices(saturationMatrix(0), contrastMatrix(1.1))
    m[.sepia] = composeMatrices(saturationMatrix(0.4), contrastMatrix(1.05), rgbScaleMatrix(1.05, 0.95, 0.82), channelOffsetMatrix(0.02, 0, -0.02))
    m[.vintage] = composeMatrices(saturationMatrix(0.8), contrastMatrix(0.9), brightnessMatrix(0.04), rgbScaleMatrix(1.08, 0.98, 0.88))
    m[.cool] = composeMatrices(saturationMatrix(1.05), contrastMatrix(1.05), rgbScaleMatrix(0.95, 1.05, 1.2), channelOffsetMatrix(-0.01, 0, 0.03))
    m[.warm] = composeMatrices(saturationMatrix(1.05), contrastMatrix(1.05), rgbScaleMatrix(1.2, 1.05, 0.9), channelOffsetMatrix(0.03, 0.02, -0.01))

    // Instagram-style filters
    m[.juno] = composeMatrices(saturationMatrix(1.25), contrastMatrix(1.12), rgbScaleMatrix(1.15, 1.0, 1.2), channelOffsetMatrix(0.03, 0, 0.02))
    m[.gingham] = composeMatrices(saturationMatrix(0.9), contrastMatrix(0.95), brightnessMatrix(0.05), rgbScaleMatrix(1.05, 1.08, 1.12), channelOffsetMatrix(-0.01, 0.01, 0.03))
    m[.clarendon] = composeMatrices(saturationMatrix(1.2), contrastMatrix(1.25), rgbScaleMatrix(1.05, 1.05, 1.18), channelOffsetMatrix(0.02, 0, 0.04))
    m[.lark] = composeMatrices(saturationMatrix(1.1), contrastMatrix(1.08), brightnessMatrix(0.04), rgbScaleMatrix(0.98, 1.06, 1.12), channelOffsetMatrix(0, 0.02, 0.05))
    m[.ludwig] = composeMatrices(saturationMatrix(0.85), contrastMatrix(1.1), rgbScaleMatrix(1.18, 1.05, 0.92), channelOffsetMatrix(0.04, 0.02, -0.02))
    m[.xproii] = composeMatrices(saturationMatrix(1.3), contrastMatrix(1.35), rgbScaleMatrix(1.25, 1.05, 0.9), channelOffsetMatrix(0.02, -0.01, -0.02))
    m[.lofi] = composeMatrices(saturationMatrix(1.7), contrastMatrix(1.55), brightnessMatrix(-0.05), rgbScaleMatrix(1.18, 1.1, 1.02), channelOffsetMatrix(0.02, -0.01, -0.03))
    m[.mayfair] = composeMatrices(saturationMatrix(1.2), contrastMatrix(1.12), brightnessMatrix(0.06), rgbScaleMatrix(1.12, 1.02, 0.95), channelOffsetMatrix(0.03, 0, 0.02))
    m[.sierra] = composeMatrices(saturationMatrix(1.05), contrastMatrix(0.95), brightnessMatrix(0.05), rgbScaleMatrix(1.08, 1.02, 0.95), channelOffsetMatrix(0.02, 0.01, 0))
    m[.tattoo] = composeMatrices(saturationMatrix(1.35), contrastMatrix(1.45), brightnessMatrix(-0.04), rgbScaleMatrix(1.2, 1.1, 1.05), channelOffsetMatrix(0.02, -0.01, -0.03))
    m[.inkwell] = composeMatrices(saturationMatrix(0), contrastMatrix(1.2), brightnessMatrix(0.01))
    m[.rise] = composeMatrices(saturationMatrix(0.92), contrastMatrix(0.98), brightnessMatrix(0.08), rgbScaleMatrix(1.1, 1.02, 0.9), channelOffsetMatrix(0.04, 0.02, -0.01))

    return m
}()

// MARK: - Public API

enum ColorMatrixFilter {

    /// Returns the 20-float color matrix for a given filter, or nil if no filter / identity.
    static func getFilterColorMatrix(_ filter: ImageFilter?) -> ColorMatrix? {
        guard let filter, filter.type != .none else { return nil }
        guard let base = BASE_FILTER_MATRICES[filter.type] else { return nil }

        let intensity = clamp(filter.intensity, 0, 1)
        if intensity <= 0 { return Array(IDENTITY_MATRIX) }
        if intensity >= 1 { return Array(base) }
        return mixMatrices(IDENTITY_MATRIX, base, amount: intensity)
    }

    /// Applies a 5x4 color matrix to a CIImage using CIColorMatrix.
    /// Matrix layout: [R0 R1 R2 R3 Roff, G0 G1 G2 G3 Goff, B0 B1 B2 B3 Boff, A0 A1 A2 A3 Aoff]
    static func applyColorMatrix(_ matrix: ColorMatrix, to image: CIImage) -> CIImage {
        let filter = CIFilter(name: "CIColorMatrix")!
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(CIVector(x: matrix[0], y: matrix[1], z: matrix[2], w: matrix[3]),   forKey: "inputRVector")
        filter.setValue(CIVector(x: matrix[5], y: matrix[6], z: matrix[7], w: matrix[8]),   forKey: "inputGVector")
        filter.setValue(CIVector(x: matrix[10], y: matrix[11], z: matrix[12], w: matrix[13]), forKey: "inputBVector")
        filter.setValue(CIVector(x: matrix[15], y: matrix[16], z: matrix[17], w: matrix[18]), forKey: "inputAVector")
        filter.setValue(CIVector(x: matrix[4], y: matrix[9], z: matrix[14], w: matrix[19]),  forKey: "inputBiasVector")
        return filter.outputImage ?? image
    }

    /// Convenience: apply an ImageFilter directly to a CIImage.
    static func applyFilter(_ filter: ImageFilter?, to image: CIImage) -> CIImage {
        guard let matrix = getFilterColorMatrix(filter) else { return image }
        return applyColorMatrix(matrix, to: image)
    }
}
