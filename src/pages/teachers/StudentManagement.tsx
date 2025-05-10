import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Search, RefreshCw, Trash2, Pencil } from 'lucide-react';
import { initDB, getAllStudents, getStudentsWithPagination, deleteStudent, getStudentsByClass } from '../src/db';
import type { IDBPDatabase } from 'idb';
import type { DBSchema, Student } from '../../types';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PAGE_SIZE = 10;

const StudentManagement: React.FC = () => {
  const [db, setDb] = useState<IDBPDatabase<DBSchema> | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    firstName: '',
    lastName: '',
    className: '',
    email: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize database and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        const database = await initDB();
        setDb(database);
        await fetchStudents(database);
        await fetchClassOptions(database);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to initialize the database.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Fetch all students (for total count and class options)
  const fetchAllStudents = async (database: IDBPDatabase<DBSchema>) => {
    try {
      const allStudents = await getAllStudents(database);
      setTotalStudents(allStudents.length);
      return allStudents;
    } catch (error) {
      console.error('Failed to fetch all students:', error);
      toast({
        title: 'Data Retrieval Error',
        description: 'Failed to load student data.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Extract unique class names from all students
  const fetchClassOptions = async (database: IDBPDatabase<DBSchema>) => {
    try {
      const allStudents = await getAllStudents(database);
      const classes = [...new Set(allStudents.map(student => student.className))];
      setClassOptions(classes);
    } catch (error) {
      console.error('Failed to fetch class options:', error);
    }
  };

  // Fetch students with filtering and pagination
  const fetchStudents = async (database: IDBPDatabase<DBSchema>) => {
    setIsLoading(true);
    try {
      // Get all students first for filtering
      const allStudents = await fetchAllStudents(database);
      
      // Apply filters if any
      let filteredStudents = [...allStudents];
      
      if (filterClass) {
        filteredStudents = filteredStudents.filter(
          student => student.className === filterClass
        );
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredStudents = filteredStudents.filter(
          student => 
            student.firstName.toLowerCase().includes(searchLower) ||
            student.lastName.toLowerCase().includes(searchLower) ||
            student.email.toLowerCase().includes(searchLower)
        );
      }
      
      // Update total count of filtered results
      setTotalStudents(filteredStudents.length);
      
      // Apply pagination manually
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginatedStudents = filteredStudents.slice(start, end);
      
      setStudents(paginatedStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: 'Data Retrieval Error',
        description: 'Failed to load student data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (db) {
      await fetchStudents(db);
      await fetchClassOptions(db);
      toast({
        title: 'Data Refreshed',
        description: 'Student data has been refreshed.',
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Re-fetch when page, search term, or filter changes
  useEffect(() => {
    if (db) {
      fetchStudents(db);
    }
  }, [currentPage, searchTerm, filterClass]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle class filter change
  const handleClassFilterChange = (value: string) => {
    setFilterClass(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle creating a new student
  const handleAddStudent = async () => {
    if (!db) return;
    
    try {
      // Basic validation
      if (!newStudent.firstName || !newStudent.lastName || !newStudent.className) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
      
      // Add student to database
      await import('../src/db').then(module => {
        module.addStudent(db, newStudent);
      });
      
      // Reset form and close dialog
      setNewStudent({
        firstName: '',
        lastName: '',
        className: '',
        email: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
      });
      setIsAddDialogOpen(false);
      
      // Refresh data
      await fetchStudents(db);
      await fetchClassOptions(db);
      
      toast({
        title: 'Success',
        description: 'Student added successfully.',
      });
    } catch (error) {
      console.error('Failed to add student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student.',
        variant: 'destructive',
      });
    }
  };

  // Handle editing a student
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  // Handle updating a student
  const handleUpdateStudent = async () => {
    if (!db || !editingStudent) return;
    
    try {
      // Basic validation
      if (!editingStudent.firstName || !editingStudent.lastName || !editingStudent.className) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
      
      // Update student in database
      await import('../src/db').then(module => {
        module.updateStudent(db, editingStudent);
      });
      
      // Close dialog and refresh data
      setIsEditDialogOpen(false);
      await fetchStudents(db);
      
      toast({
        title: 'Success',
        description: 'Student updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a student
  const handleDeleteStudent = async (id: string) => {
    if (!db) return;
    
    try {
      await deleteStudent(db, id);
      await fetchStudents(db);
      
      toast({
        title: 'Success',
        description: 'Student deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student.',
        variant: 'destructive',
      });
    }
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalStudents / PAGE_SIZE));

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">Student Management</CardTitle>
              <CardDescription>
                Manage your student records efficiently
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Create a new student record in the database.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="firstName" className="text-right">
                        First Name*
                      </Label>
                      <Input
                        id="firstName"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lastName" className="text-right">
                        Last Name*
                      </Label>
                      <Input
                        id="lastName"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email || ''}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="class" className="text-right">
                        Class*
                      </Label>
                      <Select
                        value={newStudent.className}
                        onValueChange={(value) => setNewStudent({...newStudent, className: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                          <SelectItem value="new-class">+ Add New Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newStudent.className === 'new-class' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newClass" className="text-right">
                          New Class Name*
                        </Label>
                        <Input
                          id="newClass"
                          value=""
                          onChange={(e) => setNewStudent({...newStudent, className: e.target.value})}
                          className="col-span-3"
                          required
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="enrollmentDate" className="text-right">
                        Enrollment Date
                      </Label>
                      <Input
                        id="enrollmentDate"
                        type="date"
                        value={newStudent.enrollmentDate}
                        onChange={(e) => setNewStudent({...newStudent, enrollmentDate: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddStudent}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 w-full"
              />
            </div>
            <Select
              value={filterClass}
              onValueChange={handleClassFilterChange}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classOptions.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableCaption>
                    {totalStudents > 0 
                      ? `Showing ${students.length} of ${totalStudents} students`
                      : 'No students found'
                    }
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="hidden md:table-cell">Enrollment Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.id}</TableCell>
                          <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.email || '-'}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {student.enrollmentDate 
                              ? new Date(student.enrollmentDate).toLocaleDateString() 
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {student.firstName} {student.lastName}? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => student.id && handleDeleteStudent(student.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1} 
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Total Students: {totalStudents}
          </p>
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        </CardFooter>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-firstName" className="text-right">
                  First Name*
                </Label>
                <Input
                  id="edit-firstName"
                  value={editingStudent.firstName}
                  onChange={(e) => setEditingStudent({...editingStudent, firstName: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastName" className="text-right">
                  Last Name*
                </Label>
                <Input
                  id="edit-lastName"
                  value={editingStudent.lastName}
                  onChange={(e) => setEditingStudent({...editingStudent, lastName: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingStudent.email || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-class" className="text-right">
                  Class*
                </Label>
                <Select
                  value={editingStudent.className}
                  onValueChange={(value) => setEditingStudent({...editingStudent, className: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                    <SelectItem value="new-class">+ Add New Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingStudent.className === 'new-class' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-newClass" className="text-right">
                    New Class Name*
                  </Label>
                  <Input
                    id="edit-newClass"
                    value=""
                    onChange={(e) => setEditingStudent({...editingStudent, className: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-enrollmentDate" className="text-right">
                  Enrollment Date
                </Label>
                <Input
                  id="edit-enrollmentDate"
                  type="date"
                  value={editingStudent.enrollmentDate}
                  onChange={(e) => setEditingStudent({...editingStudent, enrollmentDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateStudent}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;






// import React, { useState, useEffect } from 'react';
// import { useApp } from '../../contexts/UserAppContext';
// import { Student } from '../../types';
// import { PlusCircle, Edit, Trash2, X, Save, Search } from 'lucide-react';

// const StudentManagement: React.FC = () => {
//   const { 
//     students, 
//     loading, 
//     error, 
//     addNewStudent, 
//     updateExistingStudent, 
//     removeStudent, 
//     currentTeacher,
//     loadStudentsByClass
//   } = useApp();

//   const [isAddingStudent, setIsAddingStudent] = useState(false);
//   const [isEditingStudent, setIsEditingStudent] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  
//   // Form state for new/edit student
//   const [formData, setFormData] = useState<Student>({
//     studentName: '',
//     className: currentTeacher?.className || '',
//     gender: 'Male',
//     teacherId: currentTeacher?.id || ''
//   });

//   // Initialize filtered students
//   useEffect(() => {
//     setFilteredStudents(students);
//   }, [students]);

//   // Handle search
//   useEffect(() => {
//     if (searchTerm.trim() === '') {
//       setFilteredStudents(students);
//     } else {
//     const filtered: Student[] = students.filter((student: Student): boolean => 
//       student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//       setFilteredStudents(filtered);
//     }
//   }, [searchTerm, students]);

//   // Load students when component mounts
//   useEffect(() => {
//     if (currentTeacher?.className) {
//       loadStudentsByClass(currentTeacher.className);
//     }
//   }, [currentTeacher, loadStudentsByClass]);

//   // Handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       studentName: '',
//       className: currentTeacher?.className || '',
//       gender: 'Male',
//       teacherId: currentTeacher?.id || ''
//     });
//     setIsAddingStudent(false);
//     setIsEditingStudent(null);
//   };

//   // Submit handler for adding new student
//   const handleAddStudent = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.studentName) return;
    
//     try {
//       await addNewStudent(formData);
//       resetForm();
//     } catch (err) {
//       console.error("Failed to add student:", err);
//     }
//   };

//   // Submit handler for editing student
//   const handleUpdateStudent = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.studentName || !isEditingStudent) return;
    
//     try {
//       await updateExistingStudent(formData);
//       resetForm();
//     } catch (err) {
//       console.error("Failed to update student:", err);
//     }
//   };

//   // Start editing a student
//   const startEditStudent = (student: Student) => {
//     if (!student.id) return;
//     setFormData(student);
//     setIsEditingStudent(student.id);
//     setIsAddingStudent(false);
//   };

//   // Delete student handler
//   const handleDeleteStudent = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this student?')) {
//       try {
//         await removeStudent(id);
//       } catch (err) {
//         console.error("Failed to delete student:", err);
//       }
//     }
//   };

//   return (
//     <div className="bg-white shadow-md rounded-2xl overflow-hidden">
//       <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
//         <h3 className="text-lg font-medium text-gray-900">Student Management</h3>
//         {!isAddingStudent && !isEditingStudent && (
//           <button 
//             onClick={() => setIsAddingStudent(true)}
//             className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//           >
//             <PlusCircle className="w-4 h-4 mr-2" />
//             Add Student
//           </button>
//         )}
//       </div>

//       {/* Search Bar */}
//       {!isAddingStudent && !isEditingStudent && (
//         <div className="px-6 py-4 bg-gray-50">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search students..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
//             />
//           </div>
//         </div>
//       )}

//       {/* Add Student Form */}
//       {isAddingStudent && (
//         <div className="p-6 bg-gray-50">
//           <form onSubmit={handleAddStudent} className="space-y-4">
//             <div>
//               <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
//               <input
//                 type="text"
//                 id="studentName"
//                 name="studentName"
//                 value={formData.studentName}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//             </div>
            
//             <div>
//               <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class</label>
//               <input
//                 type="text"
//                 id="className"
//                 name="className"
//                 value={formData.className}
//                 onChange={handleInputChange}
//                 readOnly
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none sm:text-sm"
//               />
//             </div>
            
//             <div>
//               <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
//               <select
//                 id="gender"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               >
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//             </div>
            
//             <div className="flex space-x-3 pt-2">
//               <button
//                 type="submit"
//                 className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 <Save className="w-4 h-4 mr-2" />
//                 Save Student
//               </button>
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 <X className="w-4 h-4 mr-2" />
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Edit Student Form */}
//       {isEditingStudent && (
//         <div className="p-6 bg-gray-50">
//           <form onSubmit={handleUpdateStudent} className="space-y-4">
//             <div>
//               <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
//               <input
//                 type="text"
//                 id="studentName"
//                 name="studentName"
//                 value={formData.studentName}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//             </div>
            
//             <div>
//               <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class</label>
//               <input
//                 type="text"
//                 id="className"
//                 name="className"
//                 value={formData.className}
//                 onChange={handleInputChange}
//                 readOnly
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none sm:text-sm"
//               />
//             </div>
            
//             <div>
//               <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
//               <select
//                 id="gender"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               >
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//             </div>
            
//             <div className="flex space-x-3 pt-2">
//               <button
//                 type="submit"
//                 className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 <Save className="w-4 h-4 mr-2" />
//                 Update Student
//               </button>
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 <X className="w-4 h-4 mr-2" />
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Student List */}
//       <div className="overflow-x-auto">
//         {loading ? (
//           <div className="p-6 text-center text-gray-500">Loading students...</div>
//         ) : error ? (
//           <div className="p-6 text-center text-red-500">{error}</div>
//         ) : filteredStudents.length > 0 ? (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Student Name
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Class
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Gender
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredStudents.map((student) => (
//                 <tr key={student.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-500">{student.className}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-500">{student.gender}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex justify-end space-x-2">
//                       <button
//                         onClick={() => startEditStudent(student)}
//                         className="text-indigo-600 hover:text-indigo-900 p-1"
//                         title="Edit student"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => student.id && handleDeleteStudent(student.id)}
//                         className="text-red-600 hover:text-red-900 p-1"
//                         title="Delete student"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div className="p-6 text-center text-gray-500">
//             {searchTerm ? 'No students found matching your search.' : 'No students available. Add your first student!'}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentManagement;