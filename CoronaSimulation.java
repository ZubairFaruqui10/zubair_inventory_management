import java.util.Scanner;
public class CoronaSimulation {
    static int totalPeople = 1024;// 1024 persons' blood mixed initially
    static double CHANCE = .03; // 3% chance that random person has corona virus
    static int partitionNumber = 2; // in how many partitions sample is divided each time
   
    static double expectedTrial( int sampleSize) {
        if (sampleSize < 1)  return 0;
        double edgeChance = 1 - Math.pow(1 - CHANCE, sampleSize);
        return 1 + edgeChance * partitionNumber * expectedTrial ( sampleSize / partitionNumber);
    }
    
    public static void main(String args[]) {
        //takeInputs();
    	validateInputs();
    	System.out.println("Expected number of trials is "  + expectedTrial(totalPeople));
    	printGivenInputs();
	}

	static void takeInputs() {
    	Scanner in = new Scanner(System.in);
        System.out.println("Enter total number of people:");
        totalPeople = in.nextInt();
        System.out.println("Enter probabilty of a person having corona:");
        CHANCE = in.nextInt() /100.0;
        System.out.println("Enter numbe of partition each time:");
        partitionNumber = in.nextInt() ;
        System.out.println("Probabilty is " + CHANCE);        
	}

    static void validateInputs() {
		if(CHANCE < 0 || CHANCE > 100) 
            throw new RuntimeException ("Ensure that 0 <= Probabilty <=100.");
        if(totalPeople < 0)
            throw new RuntimeException ("Ensure that number of people >= 0.");
        if(partitionNumber <= 1 || partitionNumber > totalPeople) 
            throw new RuntimeException ("Ensure that 1 < partionNumer <= totalPeople.");
	}
    
    static void printGivenInputs() {
    	System.out.println("For total " + totalPeople + " people. " +
    			"Each person has "+ CHANCE*100 +"% chance. " +  "Partitoned in " + partitionNumber + " sets each time");		
	}
}