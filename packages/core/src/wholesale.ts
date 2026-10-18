/**
 * The wholesale models, deliberately left out of the main "@kasityot/core"
 * barrel.
 *
 * Wholesale products and prices must never reach the public site. Keeping
 * them behind their own entry point means the shop has to name this module
 * to get at them, and client/eslint.config.mjs forbids exactly that import.
 * Only the owner panel and the wholesaler panel import it.
 */

export {
  WholesaleProduct,
  type WholesaleProductDoc,
} from "./models/WholesaleProduct";
export { Wholesaler, type WholesalerDoc } from "./models/Wholesaler";
export {
  WholesaleEnquiry,
  type WholesaleEnquiryDoc,
} from "./models/WholesaleEnquiry";
