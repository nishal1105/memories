
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import MemoryCard from '@/components/MemoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemory } from '@/context/MemoryContext';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, Search, Filter, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

// Placeholder images for memories without images - high quality nature/landscape images
const placeholderImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
];

// Generate mock data for offline/development use
const generateMockMemories = (count = 5) => {
  return Array(count).fill(null).map((_, index) => ({
    id: `mock-${index}`,
    title: `Sample Memory ${index + 1}`,
    description: 'This is a placeholder memory while we connect to the server. Enjoy this beautiful image in the meantime!',
    image: placeholderImages[index % placeholderImages.length],
    tags: ['sample', 'placeholder'],
    likes: [],
    comments: [],
    creatorId: 'mock-user',
    creatorName: 'Demo User',
    creatorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&q=80',
    createdAt: new Date().toISOString(),
  }));
};

const getRandomPlaceholder = () => {
  return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
};

const Index = () => {
  const { memories, isLoading, fetchMemories, currentPage, totalPages } = useMemory();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [offlineMode, setOfflineMode] = useState(false);
  const [mockMemories, setMockMemories] = useState(() => generateMockMemories());
  
  // Handle backend connection issues
  useEffect(() => {
    const handleConnectionIssue = () => {
      if (isLoading && memories.length === 0) {
        const timeoutId = setTimeout(() => {
          if (isLoading && memories.length === 0) {
            setOfflineMode(true);
            toast({
              title: "Connection Issue",
              description: "Using sample data while trying to connect to server.",
            });
          }
        }, 3000);
        
        return () => clearTimeout(timeoutId);
      }
    };
    
    handleConnectionIssue();
  }, [isLoading, memories, toast]);
  
  // Retry connection to backend
  const handleRetryConnection = () => {
    setOfflineMode(false);
    fetchMemories();
    toast({
      title: "Reconnecting...",
      description: "Attempting to reconnect to the server.",
    });
  };
  
  // Get all unique tags from memories
  const memoriesToUse = offlineMode ? mockMemories : memories;
  
  const allTags = Array.from(
    new Set(memoriesToUse.flatMap((memory) => memory.tags))
  ).sort();
  
  // Filter memories based on search term
  const filteredMemories = memoriesToUse.filter((memory) => {
    const matchesSearch = searchTerm 
      ? memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
      
    const matchesTag = filterTag 
      ? memory.tags.includes(filterTag) 
      : true;
      
    return matchesSearch && matchesTag;
  });
  
  // Sort memories based on selected option
  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (sortOption === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOption === 'popular') {
      return b.likes.length - a.likes.length;
    }
    return 0;
  });
  
  // Apply placeholder images to memories without images
  const memoriesWithImages = sortedMemories.map(memory => {
    // Make sure ALL memories have images by assigning placeholders when needed
    if (!memory.image) {
      return { ...memory, image: getRandomPlaceholder() };
    }
    return memory;
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterTag('');
    fetchMemories();
  };
  
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchMemories(currentPage + 1);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold memory-text-gradient">Memories Feed</h1>
            {isAuthenticated && (
              <Link to="/create">
                <Button className="bg-memory-primary hover:bg-memory-secondary flex items-center gap-2">
                  <PlusCircle size={18} />
                  <span>Create Memory</span>
                </Button>
              </Link>
            )}
          </div>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search memories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    {filterTag ? `#${filterTag}` : 'All Tags'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                  <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filterTag} onValueChange={setFilterTag}>
                    <DropdownMenuRadioItem value="">All Tags</DropdownMenuRadioItem>
                    {allTags.map(tag => (
                      <DropdownMenuRadioItem key={tag} value={tag}>#{tag}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                    <DropdownMenuRadioItem value="latest">Latest</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="popular">Most Liked</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchTerm || filterTag) && (
                <Button variant="ghost" onClick={handleClearFilters}>
                  Clear
                </Button>
              )}

              {/* Retry connection button */}
              {offlineMode && (
                <Button 
                  variant="outline" 
                  onClick={handleRetryConnection} 
                  className="flex items-center gap-2 ml-2"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Reconnect</span>
                </Button>
              )}
            </div>
          </div>

          {/* Status banner for offline mode */}
          {offlineMode && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md p-3 mb-6 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between">
              <div>
                <p className="font-medium">Viewing sample data</p>
                <p className="text-xs">We're having trouble connecting to the server. Showing placeholder content for now.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetryConnection} className="shrink-0">
                Try again
              </Button>
            </div>
          )}

          {isLoading && memoriesWithImages.length === 0 ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="memory-card animate-pulse-light">
                  <div className="p-4 flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-48" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : memoriesWithImages.length > 0 ? (
            <div className="space-y-6 pb-10">
              {memoriesWithImages.map((memory) => (
                <Link key={memory.id} to={offlineMode ? "#" : `/memory/${memory.id}`} className="block">
                  <MemoryCard memory={memory} showActions={!offlineMode} />
                </Link>
              ))}
              
              {!offlineMode && currentPage < totalPages && !searchTerm && !filterTag && (
                <div className="flex justify-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">No memories found</h2>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterTag 
                  ? "No memories match your search criteria."
                  : "Be the first to share your memories!"}
              </p>
              {isAuthenticated ? (
                <Link to="/create">
                  <Button className="bg-memory-primary hover:bg-memory-secondary">
                    Create Memory
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-memory-primary hover:bg-memory-secondary">
                    Login to Share
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
