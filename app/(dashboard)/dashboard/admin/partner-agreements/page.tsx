/**
 * Admin Partner Agreements Page
 * E9-S15: Partner Agreement E-Signature System
 *
 * Features:
 * - View all signed partner agreements
 * - Filter by partner, version
 * - View agreement details including signature
 * - Agreement statistics and compliance tracking
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TIER_COLORS = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILVER: 'bg-slate-100 text-slate-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-purple-100 text-purple-800',
};

export default function AdminPartnerAgreementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch agreements
  const { data, isLoading, refetch } = trpc.admin.getPartnerAgreements.useQuery({
    limit,
    offset: page * limit,
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.getPartnerAgreementStats.useQuery();

  // Fetch single agreement when selected
  const { data: agreementDetails, isLoading: detailsLoading } =
    trpc.admin.getPartnerAgreementById.useQuery(
      { id: selectedAgreement! },
      { enabled: !!selectedAgreement }
    );

  // Filter agreements by search
  const filteredAgreements = data?.agreements?.filter((agreement) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      agreement.partner.clubName.toLowerCase().includes(query) ||
      agreement.partner.user.email.toLowerCase().includes(query) ||
      agreement.version.toLowerCase().includes(query)
    );
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-emerald-100 p-3">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Partner Agreements
              </h1>
              <p className="text-slate-600">
                View and manage partner agreement signatures
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Partners</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {statsLoading ? '...' : stats?.totalPartners || 0}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Signed Agreements</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {statsLoading ? '...' : stats?.partnersWithSignedAgreement || 0}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Signatures</p>
                  <p className="mt-2 text-3xl font-bold text-amber-600">
                    {statsLoading ? '...' : stats?.partnersWithoutAgreement || 0}
                  </p>
                </div>
                <div className="rounded-full bg-amber-100 p-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliance Rate</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {statsLoading ? '...' : `${stats?.complianceRate || 0}%`}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by club name, email, or version..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agreements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Signed Agreements</CardTitle>
            <CardDescription>
              {data?.total || 0} total agreements signed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredAgreements && filteredAgreements.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="px-6 py-3">Partner</th>
                        <th className="px-6 py-3">Tier</th>
                        <th className="px-6 py-3">Version</th>
                        <th className="px-6 py-3">Signed At</th>
                        <th className="px-6 py-3">IP Address</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredAgreements.map((agreement) => (
                        <tr key={agreement.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {agreement.partner.clubName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {agreement.partner.user.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                TIER_COLORS[agreement.partner.tier as keyof typeof TIER_COLORS]
                              )}
                            >
                              {agreement.partner.tier}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            v{agreement.version}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {new Date(agreement.signedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                            {agreement.ipAddress}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAgreement(agreement.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-slate-600">
                      Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">
                  No agreements found
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'No partners have signed agreements yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agreement Details Dialog */}
        <Dialog open={!!selectedAgreement} onOpenChange={() => setSelectedAgreement(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agreement Details</DialogTitle>
              <DialogDescription>
                Signed partner agreement information
              </DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : agreementDetails ? (
              <div className="space-y-6">
                {/* Partner Info */}
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Partner Information
                  </h4>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Club Name</dt>
                      <dd className="font-medium text-slate-900">
                        {agreementDetails.partner.clubName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Email</dt>
                      <dd className="font-medium text-slate-900">
                        {agreementDetails.partner.user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Location</dt>
                      <dd className="font-medium text-slate-900">
                        {agreementDetails.partner.clubLocation}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Referral Code</dt>
                      <dd className="font-medium text-slate-900 font-mono">
                        {agreementDetails.partner.referralCode}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Agreement Info */}
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Agreement Information
                  </h4>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Version</dt>
                      <dd className="font-medium text-slate-900">
                        v{agreementDetails.version}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Signed At</dt>
                      <dd className="font-medium text-slate-900">
                        {new Date(agreementDetails.signedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">IP Address</dt>
                      <dd className="font-medium text-slate-900 font-mono">
                        {agreementDetails.ipAddress}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Agreement ID</dt>
                      <dd className="font-medium text-slate-500 font-mono text-xs">
                        {agreementDetails.id}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Signature Preview */}
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Electronic Signature
                  </h4>
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-lg p-4">
                    {agreementDetails.signature.startsWith('data:image') ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={agreementDetails.signature}
                        alt="Partner signature"
                        className="max-h-32 mx-auto"
                      />
                    ) : (
                      <p className="text-sm text-slate-500 text-center">
                        Signature data stored securely
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedAgreement(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
