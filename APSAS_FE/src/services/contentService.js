import api from "./api";

/**
 * Get detailed content by ID
 * @param {string} contentId - The ID of the content
 * @returns {Promise<Object>} Content details with HTML and media
 */
export const getContentDetail = async (contentId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await api.get(`/contents/${contentId}`);
    // return response.data;

    // Mock data with delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: contentId,
          title: "Giới thiệu về Linked List trong Java",
          lessonNumber: 3,
          updatedAt: "2024-11-15 14:30:00",
          duration: 15, // minutes
          htmlContent: `
            <h1>Linked List trong Java</h1>
            
            <p>Linked List (danh sách liên kết) là một cấu trúc dữ liệu tuyến tính trong đó các phần tử không được lưu trữ ở các vị trí liền kề trong bộ nhớ. Thay vào đó, mỗi phần tử (node) chứa một tham chiếu (reference) đến phần tử tiếp theo trong chuỗi.</p>

            <h2>Đặc điểm chính</h2>
            
            <ul>
              <li><strong>Dynamic size:</strong> Kích thước có thể thay đổi trong runtime</li>
              <li><strong>Ease of insertion/deletion:</strong> Thêm/xóa phần tử dễ dàng hơn Array</li>
              <li><strong>No memory waste:</strong> Không lãng phí bộ nhớ do cấp phát động</li>
              <li><strong>Sequential access:</strong> Truy cập tuần tự, không truy cập trực tiếp bằng index</li>
            </ul>

            <h2>Cấu trúc Node</h2>
            
            <p>Mỗi node trong Linked List gồm 2 phần:</p>
            
            <pre><code class="language-java">class Node {
    int data;        // Dữ liệu
    Node next;       // Tham chiếu đến node tiếp theo
    
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}</code></pre>

            <h2>Các loại Linked List</h2>
            
            <h3>1. Singly Linked List</h3>
            <p>Mỗi node chỉ trỏ đến node tiếp theo. Đây là loại đơn giản nhất.</p>
            
            <h3>2. Doubly Linked List</h3>
            <p>Mỗi node có 2 con trỏ: trỏ đến node trước và node sau.</p>
            
            <h3>3. Circular Linked List</h3>
            <p>Node cuối cùng trỏ về node đầu tiên, tạo thành vòng tròn.</p>

            <h2>Các thao tác cơ bản</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Thao tác</th>
                  <th>Time Complexity</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Insert at beginning</td>
                  <td>O(1)</td>
                  <td>Thêm node vào đầu danh sách</td>
                </tr>
                <tr>
                  <td>Insert at end</td>
                  <td>O(n)</td>
                  <td>Thêm node vào cuối danh sách</td>
                </tr>
                <tr>
                  <td>Delete</td>
                  <td>O(n)</td>
                  <td>Xóa node khỏi danh sách</td>
                </tr>
                <tr>
                  <td>Search</td>
                  <td>O(n)</td>
                  <td>Tìm kiếm node trong danh sách</td>
                </tr>
              </tbody>
            </table>

            <h2>Code Implementation</h2>
            
            <pre><code class="language-java">public class LinkedList {
    private Node head;
    
    // Insert at beginning
    public void insertAtBeginning(int data) {
        Node newNode = new Node(data);
        newNode.next = head;
        head = newNode;
    }
    
    // Insert at end
    public void insertAtEnd(int data) {
        Node newNode = new Node(data);
        
        if (head == null) {
            head = newNode;
            return;
        }
        
        Node current = head;
        while (current.next != null) {
            current = current.next;
        }
        current.next = newNode;
    }
    
    // Display
    public void display() {
        Node current = head;
        while (current != null) {
            System.out.print(current.data + " -> ");
            current = current.next;
        }
        System.out.println("null");
    }
}</code></pre>

            <h2>Ưu và nhược điểm</h2>
            
            <h3>Ưu điểm</h3>
            <ul>
              <li>Kích thước động, không cần khai báo trước</li>
              <li>Thêm/xóa phần tử hiệu quả</li>
              <li>Không lãng phí bộ nhớ</li>
            </ul>
            
            <h3>Nhược điểm</h3>
            <ul>
              <li>Truy cập phần tử chậm hơn Array (phải duyệt tuần tự)</li>
              <li>Tốn thêm bộ nhớ cho con trỏ</li>
              <li>Không hỗ trợ random access</li>
            </ul>

            <blockquote>
              <p><strong>Lưu ý:</strong> Trong Java, LinkedList là một phần của Collections Framework và implement cả List và Deque interface. Bạn có thể sử dụng <code>java.util.LinkedList</code> thay vì implement từ đầu.</p>
            </blockquote>

            <h2>Bài tập thực hành</h2>
            
            <ol>
              <li>Implement phương thức <code>reverse()</code> để đảo ngược danh sách</li>
              <li>Viết phương thức <code>findMiddle()</code> tìm phần tử ở giữa</li>
              <li>Implement <code>detectLoop()</code> để phát hiện vòng lặp trong danh sách</li>
              <li>Viết phương thức <code>mergeSorted()</code> để gộp 2 danh sách đã sắp xếp</li>
            </ol>
          `,
          videos: [
            {
              url: "https://www.w3schools.com/html/mov_bbb.mp4",
              thumbnail:
                "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
              title: "Giới thiệu Linked List",
              description:
                "Video giải thích chi tiết về cấu trúc Linked List và cách hoạt động",
              duration: "12:35",
            },
            {
              url: "https://www.w3schools.com/html/movie.mp4",
              thumbnail:
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
              title: "Implementation trong Java",
              description: "Hướng dẫn code Linked List từ đầu trong Java",
              duration: "18:42",
            },
            {
              url: "https://www.w3schools.com/html/mov_bbb.mp4",
              thumbnail:
                "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
              title: "Các thao tác cơ bản",
              description: "Demo insert, delete, search trong Linked List",
              duration: "15:20",
            },
          ],
          images: [
            {
              url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
              caption: "Sơ đồ cấu trúc Singly Linked List",
            },
            {
              url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
              caption: "Minh họa thao tác Insert at Beginning",
            },
            {
              url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop",
              caption: "So sánh Array vs Linked List",
            },
            {
              url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
              caption: "Doubly Linked List structure",
            },
            {
              url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop",
              caption: "Time Complexity của các thao tác",
            },
            {
              url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
              caption: "Memory allocation trong Linked List",
            },
          ],
        });
      }, 800);
    });
  } catch (error) {
    console.error("Error fetching content detail:", error);
    throw error;
  }
};

/**
 * Get list of contents for a course
 * @param {string} courseId - The ID of the course
 * @returns {Promise<Array>} List of contents
 */
export const getCourseContents = async (courseId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await api.get(`/courses/${courseId}/contents`);
    // return response.data;

    // Mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "content-1",
            title: "Giới thiệu về Linked List trong Java",
            type: "lesson",
            lessonNumber: 1,
            duration: 15,
            completed: true,
          },
          {
            id: "content-2",
            title: "Cấu trúc dữ liệu Stack và Queue",
            type: "lesson",
            lessonNumber: 2,
            duration: 20,
            completed: true,
          },
          {
            id: "content-3",
            title: "Binary Tree và Binary Search Tree",
            type: "lesson",
            lessonNumber: 3,
            duration: 25,
            completed: false,
          },
        ]);
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching course contents:", error);
    throw error;
  }
};

/**
 * Mark content as completed
 * @param {string} contentId - The ID of the content
 * @returns {Promise<Object>} Success response
 */
export const markContentAsCompleted = async (contentId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await api.post(`/contents/${contentId}/complete`);
    // return response.data;

    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Content marked as completed",
        });
      }, 500);
    });
  } catch (error) {
    console.error("Error marking content as completed:", error);
    throw error;
  }
};

export default {
  getContentDetail,
  getCourseContents,
  markContentAsCompleted,
};
