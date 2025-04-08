import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-gray-500 ">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Link href={item.href} className="text-sm font-medium text-gray-500 hover:text-blue-600">
            {item.label}
          </Link>
          {index < items.length - 1 && <span className="text-gray-400">/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;