import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { CouponManager } from "@/components/admin/coupon-manager";
import { getCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdmin();
  const coupons = getCoupons();

  return (
    <AdminShell active="/admin/coupons" title="Discount codes">
      <CouponManager coupons={coupons} />
    </AdminShell>
  );
}
