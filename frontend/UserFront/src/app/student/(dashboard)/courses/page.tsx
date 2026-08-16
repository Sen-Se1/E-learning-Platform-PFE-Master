"use client"

import React from "react"
import { CatalogContent } from "@/components/courses/catalog-content"

export default function StudentCoursesPage() {
    return (
        <div className="p-4 md:p-8">
            <CatalogContent basePath="/student/courses" enrolledOnly={false} />
        </div>
    )
}
