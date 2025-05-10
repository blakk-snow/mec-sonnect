// TeacherSelection.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, Search, CheckCircle2, Eye, EyeOff } from 'lucide-react';

// Import Teacher type from types file
import { Teacher } from '../../types/index';

// shadcn imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

// Import service instead of using mock data directly
import { authenticateUser, checkAccountExists } from '../../services/authService';
import { preconfiguredTeachers } from './preconfiguredTeachers';

// Types and Interfaces
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

interface EmptySearchResultProps {
  searchTerm: string;
}

interface TeacherCardProps {
  teacher: Teacher;
  isSelected: boolean;
  onSelect: () => void;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeacher: string | null;
  teacherData: Teacher | undefined;
  password: string;
  showPassword: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  authError: string;
  onSignUp: () => void;
  onLogin: () => void;
  isLoading: boolean;
}

// Constants
enum CATEGORIES {
  JHS = 'jhs',
  UPPER = 'upper',
  LOWER = 'lower',
  PRESCHOOL = 'preschool',
  ADMIN = 'admin',
  ALL = 'all'
}

const TeacherSelection: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES.ALL);
  const [showSignUpDialog, setShowSignUpDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // Group teachers by category
  const categoryClassMappings: Record<string, string[]> = {
    [CATEGORIES.JHS]: ['Basic 7', 'Basic 8', 'Basic 9'],
    [CATEGORIES.UPPER]: ['Basic 4', 'Basic 5', 'Basic 6'],
    [CATEGORIES.LOWER]: ['Basic 1', 'Basic 2', 'Basic 3'],
    [CATEGORIES.PRESCHOOL]: ['Kindergarten', 'Nursery']
  };

  // Helper function to determine teacher category
  const getTeacherCategory = (classLevel: string): string => {
    for (const [category, classPatterns] of Object.entries(categoryClassMappings)) {
      if (classPatterns.some(pattern => classLevel.includes(pattern))) {
        return category;
      }
    }
    return CATEGORIES.ADMIN;
  };

  
  // Filter teachers based on search term and active tab
const filteredTeachers = preconfiguredTeachers.filter(teacher => {
    const matchesSearch = !searchTerm.trim() || 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      teacher.classLevel.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === CATEGORIES.ALL) return matchesSearch;
    
    const teacherCategory = getTeacherCategory(teacher.classLevel);
    return matchesSearch && teacherCategory === activeTab;
});

  // Form handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (authError) setAuthError(''); // Clear error when typing
  };

  // UI action handlers
  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    setShowAuthModal(true);
    setAuthError('');
    setPassword('');
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setPassword('');
    setAuthError('');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = () => {
    setShowSignUpDialog(true);
  };

  const handleLogin = () => {
    navigate('/login', { state: { teacherId: selectedTeacher } });
  };

  // Authentication handling
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedTeacher) return;
    
    setIsLoading(true);
    
    try {
      const hasAccount = await checkAccountExists(selectedTeacher);
      
      if (!hasAccount) {
        navigate('/signup', { state: { teacherId: selectedTeacher } });
        return;
      }
      
      const isAuthenticated = await authenticateUser(selectedTeacher, password);
      
      if (isAuthenticated) {
        navigate('/dashboard', { state: { teacherId: selectedTeacher } });
      } else {
        setAuthError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again later.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Welcome Section */}
        <WelcomeCard />

        {/* Teacher Selection */}
        <Card>
          <div className="p-6 pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-semibold">Teachers Directory</h2>
              <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={handleSearchChange} 
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="p-6 pt-0">
            <CategoryTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
            />

            {filteredTeachers.length === 0 ? (
              <EmptySearchResult searchTerm={searchTerm} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Assuming filteredTeachers are items from preconfiguredTeachers. */}
                {/* These items are expected to have id, name, classLevel, subjects, and taCode (after you update preconfiguredTeachers.ts) */}
                {filteredTeachers.map(apiTeacher => (
                  <TeacherCard
                    key={apiTeacher.id}
                    teacher={{
                      id: apiTeacher.id,
                      teacherName: apiTeacher.name, // Maps from 'name'
                      className: apiTeacher.classLevel, // Maps from 'classLevel'
                      subjects: apiTeacher.subjects,
                      taCode: apiTeacher.taCode, // Access taCode from preconfiguredTeachers
                    } as Teacher} // Asserting the mapped object conforms to the Teacher type
                    isSelected={selectedTeacher === apiTeacher.id}
                    onSelect={() => handleTeacherSelect(apiTeacher.id as string)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeModal}
        selectedTeacher={selectedTeacher} // This prop might be used by AuthModal for other logic
        teacherData={(() => {
          const apiTeacher = preconfiguredTeachers.find(t => t.id === selectedTeacher);
          if (!apiTeacher) return undefined;
          return {
            id: apiTeacher.id,
            teacherName: apiTeacher.name, // Maps from 'name'
            className: apiTeacher.classLevel, // Maps from 'classLevel'
            subjects: apiTeacher.subjects,
            taCode: apiTeacher.taCode, // Access taCode from preconfiguredTeachers
          } as Teacher; // Asserting the mapped object conforms to the Teacher type
        })()}
        password={password}
        showPassword={showPassword}
        onPasswordChange={handlePasswordChange}
        onTogglePasswordVisibility={togglePasswordVisibility}
        onSubmit={handlePasswordSubmit}
        authError={authError}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
        isLoading={isLoading}
      />

      {/* Sign Up Dialog */}
      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Required</DialogTitle>
            <DialogDescription>
              Please contact Management for an account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSignUpDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

// Component extraction for better organization
const Header: React.FC = () => (
  <header className="bg-indigo-700 text-white shadow-sm">
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">MEC Connect</span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Teacher Portal
          </Badge>
        </div>
        <Link to="/">
          <Button variant="ghost" size="icon" className="text-white hover:bg-indigo-600">
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
      </div>
    </div>
  </header>
);

const WelcomeCard: React.FC = () => (
  <div className="mb-8">
    <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <Badge variant="outline" className="w-fit mb-2 bg-background">
          Teacher Selection
        </Badge>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Select Your Profile
        </CardTitle>
        <CardDescription className="text-lg">
          Choose your teacher profile to access your personalized dashboard and resources.
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => (
  <div className="relative w-full md:w-auto">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
    <Input
      placeholder="Search teachers..."
      className="pl-9 w-full md:w-[300px]"
      value={searchTerm}
      onChange={onSearchChange}
      aria-label="Search teachers"
    />
  </div>
);

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeTab, onTabChange }) => (
  <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50">
      <TabsTrigger value="all" className="py-2 text-xs">All</TabsTrigger>
      <TabsTrigger value="jhs" className="py-2 text-xs">JHS</TabsTrigger>
      <TabsTrigger value="upper" className="py-2 text-xs whitespace-nowrap">Upper Primary</TabsTrigger>
      <TabsTrigger value="lower" className="py-2 text-xs whitespace-nowrap">Lower Primary</TabsTrigger>
      <TabsTrigger value="preschool" className="py-2 text-xs">Preschool</TabsTrigger>
      <TabsTrigger value="admin" className="py-2 text-xs">Admin</TabsTrigger>
    </TabsList>
  </Tabs>
);

const EmptySearchResult: React.FC<EmptySearchResultProps> = ({ searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
    <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
    <h3 className="text-lg font-medium">No teachers found</h3>
    <p className="text-sm text-muted-foreground">
      {searchTerm.trim() ? 'Try a different search term' : 'No teachers in this category'}
    </p>
  </div>
);

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, isSelected, onSelect }) => {
  const getInitials = (name: string): string => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const getCategoryColor = (): string => {
    if (teacher.className.includes('Basic 7') || teacher.className.includes('Basic 8')) {
      return 'bg-blue-600';
    } else if (teacher.className.includes('Basic 4') || teacher.className.includes('Basic 5') || teacher.className.includes('Basic 6')) {
      return 'bg-green-600';
    } else if (teacher.className.includes('Basic 1') || teacher.className.includes('Basic 2') || teacher.className.includes('Basic 3')) {
      return 'bg-purple-600';
    } else if (teacher.className.includes('Kindergarten') || teacher.className.includes('Nursery')) {
      return 'bg-pink-600';
    } else {
      return 'bg-gray-600';
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className={`${getCategoryColor()} text-white`}>
            {getInitials(teacher.teacherName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium text-lg">{teacher.teacherName}</h3>
          <p className="text-sm text-muted-foreground">{teacher.className}</p>
        </div>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" aria-label="Selected" />}
      </CardContent>
    </Card>
  );
};

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  // selectedTeacher,
  teacherData,
  password,
  showPassword,
  onPasswordChange,
  onTogglePasswordVisibility,
  onSubmit,
  authError,
  onSignUp,
  onLogin,
  isLoading
}) => (
  <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {teacherData?.teacherName || 'Teacher Login'}
        </DialogTitle>
        <DialogDescription>
          Enter your password to access your account
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={onPasswordChange}
              className="pr-10"
              placeholder="Enter your password"
              autoFocus
              aria-invalid={!!authError}
              disabled={isLoading}
            />
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={onTogglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? 
                <EyeOff className="h-4 w-4" aria-hidden="true" /> : 
                <Eye className="h-4 w-4" aria-hidden="true" />
              }
            </Button>
          </div>
        </div>
        
        {authError && (
          <Alert variant="destructive">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Continue"}
          </Button>
        </DialogFooter>
      </form>

      <div className="flex flex-col gap-2 text-sm text-center">
        <Button 
          variant="link" 
          onClick={onSignUp} 
          className="text-primary h-auto p-0"
          disabled={isLoading}
        >
          Don't have an account? Sign up
        </Button>
        <Button 
          variant="link" 
          onClick={onLogin} 
          className="text-primary h-auto p-0"
          disabled={isLoading}
        >
          Already have an account? Log in
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const Footer: React.FC = () => (
  <footer className="bg-muted/50 border-t mt-auto">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MagMax Educational Centre</p>
        <p>All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default TeacherSelection;