// Supported programming languages for code submission
// NOTE: Các template đã được update driver code để đọc stdin và in ra stdout cho Judge0
export const SUPPORTED_LANGUAGES = [
  {
    id: 91,
    value: "java",
    label: "Java",
    name: "Java (JDK 17.0.6)",
    version: "JDK 17.0.6",
    description: "Java programming language with JDK 17 LTS",
    // Lưu ý: Class phải tên là Main để Judge0 nhận diện
    template: `import java.util.Scanner;

public class Main {
    // Học viên viết logic vào đây
    public String solve(String input) {
        // Your code here
        return "";
    }

    // Driver Code: Đọc input và in output cho hệ thống chấm
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String input = scanner.nextLine();
            
            Main app = new Main();
            String result = app.solve(input);
            
            System.out.println(result);
        }
    }
}`
  },
  {
    id: 106,
    value: "golang",
    label: "Go",
    name: "Go (1.22.0)",
    version: "1.22.0",
    description: "Go programming language",
    template: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

// Học viên viết logic vào đây
func solve(input string) string {
    // Your code here
    return ""
}

// Driver Code: Đọc input và in output cho hệ thống chấm
func main() {
    reader := bufio.NewReader(os.Stdin)
    input, _ := reader.ReadString('\n')
    input = strings.TrimSpace(input)
    
    result := solve(input)
    fmt.Println(result)
}`
  },
  {
    id: 102,
    value: "javascript",
    label: "JavaScript",
    name: "JavaScript (Node.js 22.08.0)",
    version: "Node.js 22.08.0",
    description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
    template: `/**
 * @param {string} input
 * @returns {string}
 */
function solve(input) {
    // Your code here
    return "";
}

// Driver Code: Đọc input và in output cho hệ thống chấm
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    console.log(solve(input));
} catch (e) {
    // Xử lý trường hợp input rỗng nếu cần
    console.log("");
}
`
  },
  {
    id: 113,
    value: "python",
    label: "Python",
    name: "Python (3.14.0)",
    version: "3.14.0",
    description: "Python programming language",
    template: `import sys

def solve(input_str):
    # Your code here
    return ""

# Driver Code: Đọc input và in output cho hệ thống chấm
if __name__ == "__main__":
    # Đọc toàn bộ input từ stdin và loại bỏ khoảng trắng thừa
    input_data = sys.stdin.read().strip()
    
    result = solve(input_data)
    print(result)`
  },
  {
    id: 105,
    value: "cpp",
    label: "C++",
    name: "C++ (GCC 14.1.0)",
    version: "GCC 14.1.0",
    description: "C++ programming language with GCC compiler",
    template: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

// Học viên viết logic vào đây
string solve(string input) {
    // Your code here
    return "";
}

// Driver Code: Đọc input và in output cho hệ thống chấm
int main() {
    string input;
    // Đọc cả dòng bao gồm khoảng trắng
    if (getline(cin, input)) {
        // Loại bỏ ký tự xuống dòng thừa nếu có (tuỳ môi trường)
        if (!input.empty() && input[input.length()-1] == '\r') {
            input.erase(input.length()-1);
        }
        
        cout << solve(input) << endl;
    }
    return 0;
}`
  }
];

// Helper functions
export const getLanguageById = (id) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.id === id);
};

export const getLanguageByValue = (value) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.value === value);
};

export const getDefaultCodeTemplate = (languageValue) => {
  const language = getLanguageByValue(languageValue);
  return language?.template || "";
};