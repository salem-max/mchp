"use client"

import CustomerList from '../CustomerList'

export default function CustomerDirectoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <CustomerList />
    </div>
  )
}
