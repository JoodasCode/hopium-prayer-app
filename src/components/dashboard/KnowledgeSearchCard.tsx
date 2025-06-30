'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import KnowledgeSearch from '../KnowledgeSearch';

export function KnowledgeSearchCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Knowledge Search
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <KnowledgeSearch />
        </CardContent>
      )}
      {!isExpanded && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Search the knowledge base for prayer guidance, techniques, and spiritual insights.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
