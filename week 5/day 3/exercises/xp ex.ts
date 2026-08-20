export class Employee {
  private name: string; // Only accessible inside this class
  public salary: number; // Accessible anywhere
  public position: string; 
  protected department: string; // Accessible in this class and subclasses

  constructor(name: string, salary: number, position: string, department: string) {
    this.name = name;
    this.salary = salary;
    this.position = position;
    this.department = department;
  }

  public getEmployeeInfo(): string {
    return `${this.name} works as a ${this.position}.`;
  }
}