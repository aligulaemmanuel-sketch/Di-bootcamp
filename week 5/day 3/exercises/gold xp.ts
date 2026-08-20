import { Employee } from './xp ex';

class Manager extends Employee {
  constructor(name: string, salary: number, position: string, department: string) {
    super(name, salary, position, department);
  }
}

class ExecutiveManager extends Manager {
  constructor(name: string, salary: number, position: string, department: string) {
    super(name, salary, position, department);
  }

  public approveBudget(): string {
    return `Budget approved for ${this.department}.`;
  }
}

const execManager = new ExecutiveManager("Alice", 150000, "Executive Manager", "Operations");
console.log(execManager.getEmployeeInfo());     
console.log(execManager.approveBudget());