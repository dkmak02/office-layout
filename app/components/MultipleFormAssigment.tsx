const MultipleFormAssigment = (selectedDesks:any) => {
  return (
    <div>
      <h1>Multiple Form Assignment</h1>
      <p>This is a placeholder for the Multiple Form Assignment component.</p>
    </div>
  );
}
export default MultipleFormAssigment;
//(
    //     <Modal
    //       title={
    //         <div style={{ display: "flex", justifyContent: "space-between" }}>
    //           <div>Przypisanie projektu</div>
    //           <div style={{ paddingRight: 25 }}>
    //             Wybrane biurka: {selectedElements.length}
    //           </div>
    //         </div>
    //       }
    //       open={showMultipleFormModal}
    //       onCancel={() => setShowMultipleFormModal(false)}
    //       okButtonProps={{ style: { display: "none" } }}
    //       cancelButtonProps={{ style: { display: "none" } }}
    //     >
    //       <List
    //         dataSource={selectedElements}
    //         renderItem={(item) => (
    //           <List.Item>
    //             <Typography.Text>{item.name}</Typography.Text>
    //           </List.Item>
    //         )}
    //         style={{
    //           maxHeight: 300,
    //           overflowY: "auto",
    //         }}
    //       />
    //       <Select
    //         showSearch
    //         placeholder="Wybierz projekt"
    //         value={selectedProject}
    //         optionFilterProp="label"
    //         onChange={multipleProjectChange}
    //         options={projects.map((project) => ({
    //           label: project.name,
    //           value: project.code,
    //         }))}
    //         style={{ width: "100%", marginTop: 16 }}
    //       />
    //       <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
    //         <Button
    //           color="primary"
    //           variant="outlined"
    //           onClick={handleMultipleProjectChange}
    //         >
    //           Zatwierdź
    //         </Button>
    //         <Button
    //           danger
    //           onClick={() => {
    //             setShowMultipleFormModal(false);
    //             setSelectedProject(null);
    //           }}
    //         >
    //           Anuluj
    //         </Button>
    //       </div>
    //     </Modal>
    //   )