'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Grid, Map as MapIcon, Filter, Search, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  address: string | null;
  status: string;
  created_at: string;
  customer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function TechnicianFeedPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'budget' | 'recent'>('recent');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs?status=OPEN');
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.data || []));
      }
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || job.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) =>
      sortBy === 'budget'
        ? (b.budget_max ?? 0) - (a.budget_max ?? 0)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedCategory, sortBy]);

  const categories = [...new Set(jobs.map((j) => j.category))];

  const handleSubmitBid = async () => {
    if (!selectedJob || !bidAmount) return;
    setIsSubmittingBid(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(bidAmount), message: bidMessage || null }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit bid');
        return;
      }
      toast.success('Bid submitted successfully!');
      setSelectedJob(null);
      setBidAmount('');
      setBidMessage('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Plumbing: 'bg-blue-100 text-blue-800',
      Electrical: 'bg-yellow-100 text-yellow-800',
      HVAC: 'bg-cyan-100 text-cyan-800',
      Carpentry: 'bg-amber-100 text-amber-800',
      Painting: 'bg-purple-100 text-purple-800',
      Appliance: 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Jobs</h1>
          <p className="text-muted-foreground">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className="gap-2">
              <Grid className="w-4 h-4" /> List
            </Button>
            <Button variant={viewMode === 'map' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('map')} className="gap-2">
              <MapIcon className="w-4 h-4" /> Map
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-1.5 border rounded-md text-sm bg-background"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'budget' | 'recent')}
            className="px-3 py-1.5 border rounded-md text-sm bg-background"
          >
            <option value="recent">Most Recent</option>
            <option value="budget">Highest Budget</option>
          </select>
          {selectedCategory && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-xs">
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'list' ? (
        filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No jobs available</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className={getCategoryColor(job.category)}>{job.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-2 mt-2">{job.title}</h3>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>
                    {job.address && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{job.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={job.customer?.avatar_url || ''} />
                        <AvatarFallback>{job.customer?.full_name?.[0] || 'C'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{job.customer?.full_name || 'Customer'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t flex items-center justify-between">
                    <div className="font-semibold text-primary">
                      {job.budget_max
                        ? <>RM {job.budget_min?.toFixed(0) || '0'} – {job.budget_max.toFixed(0)}</>
                        : 'Budget TBD'}
                    </div>
                    <Button size="sm" onClick={() => { setSelectedJob(job); setBidAmount(job.budget_max?.toString() || ''); }}>
                      Place Bid
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-card rounded-lg border p-4">
          <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Map view coming soon. Switch to list view to browse jobs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Bid Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>Submit your bid for: {selectedJob?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bid-amount">Your Bid Amount (RM)</Label>
              <Input
                id="bid-amount"
                type="number"
                placeholder="Enter your bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              {selectedJob?.budget_max && (
                <p className="text-xs text-muted-foreground">
                  Customer budget: RM {selectedJob.budget_min?.toFixed(0) || '0'} – {selectedJob.budget_max.toFixed(0)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bid-message">Message (Optional)</Label>
              <Textarea
                id="bid-message"
                placeholder="Introduce yourself and explain why you're the best fit..."
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
            <Button onClick={handleSubmitBid} disabled={isSubmittingBid || !bidAmount}>
              {isSubmittingBid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
