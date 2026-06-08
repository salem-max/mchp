"use client"

import { motion } from "framer-motion";
import { Star, MapPin, Wrench, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TechnicianCardProps {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  skills?: string[];
  avgRating?: number;
  isAvailable?: boolean;
  verified?: boolean;
  hourlyRate?: number;
  location?: string;
  onSelect?: (id: string) => void;
  onMessage?: (id: string) => void;
}

export default function TechnicianCard({
  id, name, email, avatarUrl, skills = [], avgRating = 0,
  isAvailable, verified, hourlyRate, location, onSelect, onMessage,
}: TechnicianCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl shadow-md p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            {verified && <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />}
          </div>
          {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {avgRating.toFixed(1)}
            </span>
            {hourlyRate && <span>RM {hourlyRate}/hr</span>}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isAvailable ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> Available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              <XCircle className="w-3 h-3" /> Busy
            </span>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((s: any) => (
            <Badge key={s} variant="secondary" className="text-xs gap-1">
              <Wrench className="w-2.5 h-2.5" />{s}
            </Badge>
          ))}
          {skills.length > 5 && <Badge variant="outline" className="text-xs">+{skills.length - 5}</Badge>}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onSelect && (
          <Button size="sm" className="flex-1" onClick={() => onSelect(id)}>Assign</Button>
        )}
        {onMessage && (
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onMessage(id)}>Message</Button>
        )}
      </div>
    </motion.div>
  );
}
