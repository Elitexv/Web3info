import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Subscribers", robots: { index: false } };

export default async function SubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-bold">
        Subscribers ({subscribers.length})
      </h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(s.subscribedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No subscribers yet.
          </p>
        )}
      </div>
    </div>
  );
}
