import Foundation
import React
import StoreKit

/// StoreKit verifies Apple's signed transactions locally. No shared secret or
/// receipt, account identifier, or payment details are passed to JavaScript.
@objc(MarqoProBilling)
class MarqoProBilling: RCTEventEmitter {
  private let productIDs: Set<String> = [
    "com.artifex.app.pro.monthly", "com.artifex.app.pro.yearly"
  ]
  private var updatesTask: Task<Void, Never>?

  override static func requiresMainQueueSetup() -> Bool { true }
  override func supportedEvents() -> [String]! { ["MarqoProChanged"] }

  override func startObserving() {
    updatesTask?.cancel()
    updatesTask = Task { @MainActor [weak self] in
      for await result in Transaction.updates {
        guard let self = self, !Task.isCancelled else { return }
        guard case .verified(let transaction) = result,
              self.productIDs.contains(transaction.productID) else { continue }
        self.sendEvent(withName: "MarqoProChanged", body: nil)
        await transaction.finish()
      }
    }
  }

  override func stopObserving() {
    updatesTask?.cancel()
    updatesTask = nil
  }

  deinit { updatesTask?.cancel() }

  private func entitlement() async -> [String: Any] {
    var selected: Transaction?
    for await result in Transaction.currentEntitlements {
      guard case .verified(let transaction) = result,
            productIDs.contains(transaction.productID),
            transaction.productType == .autoRenewable,
            transaction.revocationDate == nil,
            !transaction.isUpgraded,
            let expiration = transaction.expirationDate,
            expiration > Date() else { continue }
      if selected == nil || expiration > selected!.expirationDate! {
        selected = transaction
      }
    }
    guard let transaction = selected, let expiration = transaction.expirationDate else {
      return ["productId": NSNull(), "expiresAt": NSNull()]
    }
    return ["productId": transaction.productID, "expiresAt": expiration.timeIntervalSince1970 * 1000]
  }

  @objc(getProducts:rejecter:)
  func getProducts(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      do {
        let products = try await Product.products(for: productIDs)
        var response: [[String: Any]] = []
        for product in products where product.type == .autoRenewable {
          var trialDays = 0
          let eligible = await product.subscription?.isEligibleForIntroOffer ?? false
          if let offer = product.subscription?.introductoryOffer, offer.paymentMode == .freeTrial {
            switch offer.period.unit {
            case .day: trialDays = offer.period.value * offer.periodCount
            case .week: trialDays = offer.period.value * offer.periodCount * 7
            default: break // Only day/week trials are used by these products.
            }
          }
          response.append([
            "id": product.id, "displayPrice": product.displayPrice,
            "price": NSDecimalNumber(decimal: product.price).doubleValue,
            "currency": product.priceFormatStyle.currencyCode,
            "trialDays": trialDays, "trialEligible": eligible
          ])
        }
        resolve(response)
      } catch { reject("store-unavailable", "The App Store could not load subscriptions.", nil) }
    }
  }

  @objc(getEntitlement:rejecter:)
  func getEntitlement(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { resolve(await entitlement()) }
  }

  @objc(purchase:resolver:rejecter:)
  func purchase(_ id: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard productIDs.contains(id) else {
      reject("invalid-product", "Unknown subscription.", nil); return
    }
    Task { @MainActor in
      do {
        guard AppStore.canMakePayments,
              let product = try await Product.products(for: [id]).first,
              product.type == .autoRenewable else {
          reject("store-unavailable", "This subscription is unavailable.", nil); return
        }
        switch try await product.purchase() {
        case .success(let result):
          guard case .verified(let transaction) = result,
                productIDs.contains(transaction.productID) else {
            reject("verification-failed", "The purchase could not be verified.", nil); return
          }
          let current = await entitlement()
          resolve(["status": "purchased", "entitlement": current])
          await transaction.finish()
          sendEvent(withName: "MarqoProChanged", body: nil)
        case .userCancelled: resolve(["status": "cancelled"])
        case .pending: resolve(["status": "pending"])
        @unknown default: reject("unknown-result", "The purchase did not complete.", nil)
        }
      } catch StoreKitError.userCancelled {
        resolve(["status": "cancelled"])
      } catch let error as SKError where error.code == .paymentCancelled {
        resolve(["status": "cancelled"])
      } catch { reject("purchase-failed", "The purchase could not be completed. Please try again.", nil) }
    }
  }

  @objc(restore:rejecter:)
  func restore(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      do {
        try await AppStore.sync()
        resolve(await entitlement())
      } catch { reject("restore-failed", "Purchases could not be restored.", nil) }
    }
  }
}
